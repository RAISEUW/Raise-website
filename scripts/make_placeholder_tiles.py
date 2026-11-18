import math, random, sys
from PIL import Image, ImageDraw
OUT = sys.argv[1]
W, H, S = 640, 480, 4
BG=(251,250,247); INK=(60,60,70); GRID=(226,224,218); PURPLE=(75,46,131); GOLD=(183,165,122); RED=(214,96,86); TEAL=(74,163,184)
def canvas():
    im = Image.new('RGB', (W*S, H*S), BG); return im, ImageDraw.Draw(im)
def save(im, name):
    im.resize((W, H), Image.LANCZOS).save(f'{OUT}/{name}.webp', 'WEBP', quality=88)

# Metacognition: reliability diagram (illustrative, synthetic)
im, d = canvas()
x0, y0, x1, y1 = 90*S, 50*S, 590*S, 430*S
for i in range(11):
    gx = x0 + (x1-x0)*i/10; gy = y1 - (y1-y0)*i/10
    d.line([(gx,y0),(gx,y1)], fill=GRID, width=S); d.line([(x0,gy),(x1,gy)], fill=GRID, width=S)
d.line([(x0,y1),(x1,y1)], fill=INK, width=2*S); d.line([(x0,y0),(x0,y1)], fill=INK, width=2*S)
acc = [0.08,0.14,0.22,0.30,0.37,0.45,0.52,0.60,0.69,0.80]
bw = (x1-x0)/10
for i,a in enumerate(acc):
    conf = (i+0.5)/10
    bx = x0 + bw*i
    top = y1 - (y1-y0)*a; ctop = y1 - (y1-y0)*conf
    d.rectangle([bx+3*S, min(ctop,top), bx+bw-3*S, max(ctop,top)], fill=(240,205,200))  # gap = overconfidence
    d.rectangle([bx+3*S, top, bx+bw-3*S, y1], fill=PURPLE)
# diagonal, dashed
n=40
for k in range(n):
    if k%2: continue
    t0,t1=k/n,(k+1)/n
    d.line([(x0+(x1-x0)*t0, y1-(y1-y0)*t0),(x0+(x1-x0)*t1, y1-(y1-y0)*t1)], fill=INK, width=3*S)
save(im, 'metacognition')

# KUOW: broadcast waveform with a few flagged segments (illustrative)
im, d = canvas()
random.seed(7)
cy = H*S/2; n = 96; left, right = 40*S, 600*S; step=(right-left)/n
d.line([(left,cy),(right,cy)], fill=GRID, width=2*S)
flag = set(list(range(30,37))+list(range(66,71)))
for i in range(n):
    env = 0.25+0.75*abs(math.sin(i/n*math.pi*2.3+0.4))*(0.6+0.4*math.sin(i/7.0))
    a = max(0.06, env*random.uniform(0.45,1.0))*170*S
    x = left + i*step + step/2
    col = GOLD if i in flag else PURPLE
    d.rounded_rectangle([x-step*0.3, cy-a, x+step*0.3, cy+a], radius=int(step*0.3), fill=col)
save(im, 'kuow')

# ICEOUT: abstract report density on a street grid (illustrative, not real locations)
im, d = canvas()
random.seed(3)
for gx in range(0, W*S, 46*S): d.line([(gx+random.randint(-3,3)*S,0),(gx,H*S)], fill=GRID, width=2*S)
for gy in range(0, H*S, 46*S): d.line([(0,gy),(W*S,gy+random.randint(-3,3)*S)], fill=GRID, width=2*S)
d.line([(0,360*S),(W*S,120*S)], fill=(214,211,203), width=7*S)  # arterial
d.line([(220*S,0),(300*S,H*S)], fill=(214,211,203), width=7*S)
centers=[(180,150,42),(430,300,60),(330,190,30),(520,110,26),(120,370,34)]
pts=[]
for cx,cy,r in centers:
    for _ in range(int(r*1.1)):
        ang=random.uniform(0,2*math.pi); rr=abs(random.gauss(0,r*0.55))
        pts.append((cx+rr*math.cos(ang), cy+rr*math.sin(ang)))
for _ in range(70): pts.append((random.uniform(10,630), random.uniform(10,470)))
for x,y in pts:
    rad=random.choice([4,4,5,6])*S
    d.ellipse([x*S-rad,y*S-rad,x*S+rad,y*S+rad], fill=TEAL, outline=None)
for cx,cy,r in centers:
    R=r*0.9*S
    d.ellipse([cx*S-R,cy*S-R,cx*S+R,cy*S+R], outline=PURPLE, width=3*S)
save(im, 'iceout')
