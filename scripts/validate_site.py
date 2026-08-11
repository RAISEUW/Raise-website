#!/usr/bin/env python3
"""Dependency-free release gate for the static RAISE site."""

from __future__ import annotations

import json
import re
import sys
import unicodedata
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse, urlsplit, urlunsplit


ROOT = Path(__file__).resolve().parents[1]
ALLOWED_THEMES = {"alignment", "misinformation", "llm", "fairness", "nlp", "search", "privacy", "ethics"}
ALLOWED_RESOURCE_LABELS = {"Project site", "Project hub", "Open paper", "Code", "Dataset"}
SECRET_PATTERNS = {
    "GitHub token": re.compile(r"(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})"),
    "AWS access key": re.compile(r"AKIA[0-9A-Z]{16}"),
    "private key": re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
}
FORBIDDEN_PATHS = (
    Path("admin.html"),
    Path("assets/admin.js"),
    Path("assets/admin.css"),
    Path("research-aims.html"),
)
OFFICIAL_LOGO_PATH = "assets/raise-logo-uw-white.webp"
SITE_DATA_PATH = ROOT / "data/site-data.js"
SITE_DATA_PATTERN = re.compile(r"\Awindow\.RAISE_SITE_DATA\s*=\s*(\{.*\})\s*;\s*\Z", re.DOTALL)


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.ids: list[str] = []
        self.refs: list[str] = []
        self.images: list[dict[str, str | None]] = []
        self.blank_links: list[dict[str, str | None]] = []
        self.inline_scripts = 0
        self.csp: str | None = None
        self.has_main_target = False
        self.has_skip_link = False

    def handle_starttag(self, tag: str, attrs_list: list[tuple[str, str | None]]) -> None:
        attrs = dict(attrs_list)
        if attrs.get("id"):
            self.ids.append(str(attrs["id"]))
        if attrs.get("id") == "main-content" and tag == "main":
            self.has_main_target = True
        if tag == "a" and attrs.get("href") == "#main-content":
            self.has_skip_link = True
        if tag in {"a", "link"} and attrs.get("href"):
            self.refs.append(str(attrs["href"]))
        if tag in {"script", "img"} and attrs.get("src"):
            self.refs.append(str(attrs["src"]))
        if tag == "script" and not attrs.get("src"):
            self.inline_scripts += 1
        if tag == "img":
            self.images.append(attrs)
        if tag == "a" and attrs.get("target") == "_blank":
            self.blank_links.append(attrs)
        if tag == "meta" and (attrs.get("http-equiv") or "").lower() == "content-security-policy":
            self.csp = attrs.get("content")


def fail(errors: list[str], message: str) -> None:
    errors.append(message)


def is_absolute_https_url(value: object) -> bool:
    if (
        not isinstance(value, str)
        or not value.strip()
        or value != value.strip()
        or re.search(r"\s", value)
    ):
        return False
    try:
        parsed = urlsplit(value)
        parsed.port
        return (
            parsed.scheme.lower() == "https"
            and bool(parsed.hostname)
            and parsed.username is None
            and parsed.password is None
        )
    except ValueError:
        return False


def normalize_title(value: str) -> str:
    normalized = unicodedata.normalize("NFKC", value).casefold()
    return " ".join(re.findall(r"[^\W_]+", normalized))


def canonicalize_url(value: str) -> str:
    parsed = urlsplit(value.strip())
    hostname = (parsed.hostname or "").casefold()
    port = parsed.port
    netloc = hostname if port in (None, 443) else f"{hostname}:{port}"
    path = parsed.path.rstrip("/") or "/"
    return urlunsplit((parsed.scheme.casefold(), netloc, path, parsed.query, ""))


def validate_pages(errors: list[str]) -> None:
    parsed: dict[str, PageParser] = {}
    for path in sorted(ROOT.glob("*.html")):
        parser = PageParser()
        parser.feed(path.read_text(encoding="utf-8"))
        parsed[path.name] = parser
        duplicates = sorted({item for item in parser.ids if parser.ids.count(item) > 1})
        if duplicates:
            fail(errors, f"{path.name}: duplicate IDs: {', '.join(duplicates)}")
        if parser.inline_scripts:
            fail(errors, f"{path.name}: inline scripts are forbidden by the release CSP")
        if not parser.csp or "script-src 'self'" not in parser.csp or "script-src 'self' 'unsafe-inline'" in parser.csp:
            fail(errors, f"{path.name}: missing self-only script CSP")
        if not parser.has_main_target or not parser.has_skip_link:
            fail(errors, f"{path.name}: skip-link/main-content contract is incomplete")
        for image in parser.images:
            if "alt" not in image:
                fail(errors, f"{path.name}: image missing alt text: {image.get('src')}")
        brand_logos = [image for image in parser.images if "brand__logo" in (image.get("class") or "").split()]
        if len(brand_logos) != 2:
            fail(errors, f"{path.name}: expected one header and one footer brand logo")
        for image in brand_logos:
            if image.get("src") != OFFICIAL_LOGO_PATH:
                fail(errors, f"{path.name}: brand logo must use {OFFICIAL_LOGO_PATH}")
        for link in parser.blank_links:
            if "noopener" not in (link.get("rel") or "").split():
                fail(errors, f"{path.name}: target=_blank link missing noopener: {link.get('href')}")

    for page_name, parser in parsed.items():
        for ref in parser.refs:
            parsed_ref = urlparse(ref)
            if parsed_ref.scheme or ref.startswith("//") or ref.startswith(("mailto:", "tel:")):
                continue
            target_name = parsed_ref.path or page_name
            target = ROOT / target_name
            if not target.exists():
                fail(errors, f"{page_name}: broken local reference: {ref}")
            elif parsed_ref.fragment and target.suffix == ".html" and parsed_ref.fragment not in parsed[target.name].ids:
                fail(errors, f"{page_name}: broken fragment reference: {ref}")


def validate_data(errors: list[str]) -> None:
    try:
        source = SITE_DATA_PATH.read_text(encoding="utf-8")
        match = SITE_DATA_PATTERN.fullmatch(source)
        if not match:
            raise ValueError("expected one window.RAISE_SITE_DATA object assignment")
        data = json.loads(match.group(1))
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        fail(errors, f"site-data.js is invalid: {exc}")
        return
    if not isinstance(data, dict):
        fail(errors, "site-data.js must assign a JSON object")
        return
    publications = data.get("publications")
    if not isinstance(publications, list):
        fail(errors, "site-data.js must contain a publications array")
        return
    seen_titles: dict[str, int] = {}
    seen_publication_urls: dict[str, int] = {}
    for index, publication in enumerate(publications, start=1):
        if not isinstance(publication, dict):
            fail(errors, f"publication {index} is not an object")
            continue
        for key in ("title", "authors", "venue", "url"):
            if not isinstance(publication.get(key), str) or not publication[key].strip():
                fail(errors, f"publication {index} has an invalid {key}")
        title = publication.get("title")
        if isinstance(title, str) and title.strip():
            normalized_title = normalize_title(title)
            previous_index = seen_titles.get(normalized_title)
            if previous_index is not None:
                fail(errors, f"publication {index} duplicates the normalized title of publication {previous_index}")
            else:
                seen_titles[normalized_title] = index
        publication_url = publication.get("url")
        canonical_publication_url: str | None = None
        if not is_absolute_https_url(publication_url):
            fail(errors, f"publication {index} URL must be an absolute HTTPS URL")
        else:
            canonical_publication_url = canonicalize_url(publication_url)
            previous_index = seen_publication_urls.get(canonical_publication_url)
            if previous_index is not None:
                fail(errors, f"publication {index} duplicates the canonical URL of publication {previous_index}")
            else:
                seen_publication_urls[canonical_publication_url] = index
        year = publication.get("year")
        if not isinstance(year, int) or isinstance(year, bool) or not 2000 <= year <= 2100:
            fail(errors, f"publication {index} has an invalid year")
        themes = publication.get("themes")
        if (
            not isinstance(themes, list)
            or not all(isinstance(theme, str) for theme in themes)
            or not set(themes).issubset(ALLOWED_THEMES)
        ):
            fail(errors, f"publication {index} has an unsupported theme")
        if not isinstance(publication.get("tags"), list):
            fail(errors, f"publication {index} tags must be an array")
        elif not all(isinstance(tag, str) and tag.strip() for tag in publication["tags"]):
            fail(errors, f"publication {index} tags must contain non-empty strings")
        short_title = publication.get("shortTitle")
        if short_title is not None and (not isinstance(short_title, str) or not short_title.strip()):
            fail(errors, f"publication {index} has an invalid shortTitle")
        resources = publication.get("resources")
        if resources is not None:
            if not isinstance(resources, list):
                fail(errors, f"publication {index} resources must be an array")
            else:
                seen_resource_urls: set[str] = set()
                for resource_index, resource in enumerate(resources, start=1):
                    if not isinstance(resource, dict):
                        fail(errors, f"publication {index} resource {resource_index} is not an object")
                        continue
                    label = resource.get("label")
                    if not isinstance(label, str) or label not in ALLOWED_RESOURCE_LABELS:
                        fail(errors, f"publication {index} resource {resource_index} has an unsupported label")
                    resource_url = resource.get("url")
                    if not is_absolute_https_url(resource_url):
                        fail(errors, f"publication {index} resource {resource_index} URL must be an absolute HTTPS URL")
                        continue
                    canonical_resource_url = canonicalize_url(resource_url)
                    if canonical_resource_url in seen_resource_urls:
                        fail(errors, f"publication {index} has duplicate resource URLs")
                    else:
                        seen_resource_urls.add(canonical_resource_url)
                    if canonical_resource_url == canonical_publication_url:
                        fail(errors, f"publication {index} resource {resource_index} duplicates its canonical URL")
        for flag in ("hero", "selected"):
            if flag in publication and not isinstance(publication[flag], bool):
                fail(errors, f"publication {index} {flag} must be a boolean")
        hero_image = publication.get("heroImage")
        if hero_image is not None:
            if not isinstance(hero_image, str) or not re.fullmatch(r"assets/hero/[a-z0-9-]+\.webp", hero_image):
                fail(errors, f"publication {index} has an invalid heroImage path")
            elif not (ROOT / hero_image).is_file():
                fail(errors, f"publication {index} heroImage does not exist: {hero_image}")
        if publication.get("hero") and not hero_image:
            fail(errors, f"publication {index} is featured in the hero but has no heroImage")
    if sum(bool(item.get("hero")) for item in publications if isinstance(item, dict)) > 5:
        fail(errors, "no more than five publications may be featured in the hero")
    hero_images = [
        item.get("heroImage")
        for item in publications
        if isinstance(item, dict) and item.get("hero") and isinstance(item.get("heroImage"), str)
    ]
    if len(hero_images) != len(set(hero_images)):
        fail(errors, "hero publications must use distinct heroImage paths")
    if sum(bool(item.get("selected")) for item in publications if isinstance(item, dict)) > 6:
        fail(errors, "no more than six publications may be selected for the homepage")


def validate_security(errors: list[str]) -> None:
    deployable = list(ROOT.glob("*.html")) + list((ROOT / "assets").glob("*.js")) + [SITE_DATA_PATH]
    for path in deployable:
        text = path.read_text(encoding="utf-8")
        for name, pattern in SECRET_PATTERNS.items():
            if pattern.search(text):
                fail(errors, f"{path.relative_to(ROOT)}: possible {name}")
        if re.search(r"\b(?:localStorage|sessionStorage)\b", text):
            fail(errors, f"{path.relative_to(ROOT)}: browser persistence is not allowed in deployable code")
    if (ROOT / "CNAME").exists():
        fail(errors, "CNAME must remain absent while the site uses its github.io URL")


def validate_removed_surfaces(errors: list[str]) -> None:
    for relative_path in FORBIDDEN_PATHS:
        if (ROOT / relative_path).exists():
            fail(errors, f"removed surface must not be deployed: {relative_path}")


def main() -> int:
    errors: list[str] = []
    validate_pages(errors)
    validate_data(errors)
    validate_security(errors)
    validate_removed_surfaces(errors)
    if errors:
        print("Release validation failed:", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1
    print("Release validation passed: HTML, links, CSP, data schema, and credential checks are clean.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
