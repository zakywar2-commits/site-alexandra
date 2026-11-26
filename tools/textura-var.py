"""Generează textura de var (limewash) a fundalurilor de prototip: pete moi, pensulări largi în „X” și granulație fină.
Textura se repetă fără margini (totul e calculat periodic). Rulează: python3 tools/textura-var.py"""
import numpy as np
from PIL import Image

W, H = 1600, 1000
rng = np.random.default_rng(21)
fy = np.fft.fftfreq(H)[:, None]
fx = np.fft.fftfreq(W)[None, :]

def filt(a, kernel_hat):
    return np.real(np.fft.ifft2(np.fft.fft2(a) * kernel_hat))

def gauss(a, s):
    return filt(a, np.exp(-2 * (np.pi * s) ** 2 * (fx ** 2 + fy ** 2)))

def brush(a, length, ang, width):
    """urmă de pensulă: lungă pe direcția ang, îngustă pe cealaltă (gaussiană anizotropă)"""
    c, s = np.cos(ang), np.sin(ang)
    u = fx * c + fy * s
    v = -fx * s + fy * c
    return filt(a, np.exp(-2 * np.pi ** 2 * ((length * u) ** 2 + (width * v) ** 2)))

def norm(a):
    a = a - a.mean()
    return a / (a.std() + 1e-9)

n = lambda: rng.standard_normal((H, W))
pete = 0.8 * norm(gauss(n(), 110)) + 0.45 * norm(gauss(n(), 35))
pens = np.zeros((H, W))
for i in range(6):
    ang = (0.6 if i % 2 else -0.6) + rng.uniform(-0.25, 0.25)
    pens += norm(brush(n(), rng.uniform(40, 80), ang, rng.uniform(9, 16))) * np.clip(norm(gauss(n(), 140)) + 0.3, 0, None)
pens = norm(pens)
uscat = norm(gauss(n(), 0.7))  # granulația varului uscat
t = norm(0.7 * norm(pete) + 0.26 * pens + 0.09 * uscat)
out = np.clip(0.5 + t * 0.15, 0, 1)
Image.fromarray((out * 255).astype(np.uint8), 'L').save('public/images/textura-var.webp', quality=80)
print('ok')
