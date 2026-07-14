# Security policy

## Reporting a vulnerability

Please do not open a public issue for a suspected vulnerability. Email the
RAISE team at `billhowe@uw.edu` with a description, affected URL, reproduction
steps, and potential impact. Do not include credentials or sensitive personal
data in the report.

## Site security model

This repository publishes a static GitHub Pages site. The deployed site does
not accept or store passwords, personal access tokens, API keys, or other
repository credentials. Publication updates are made directly in
`data/site-data.js`, then validated and submitted through GitHub's
authenticated pull-request workflow.

Repository administrators should keep `main` protected, require review, enable
secret scanning and push protection, enforce HTTPS for Pages, and revoke any
credential immediately if it is accidentally exposed.
