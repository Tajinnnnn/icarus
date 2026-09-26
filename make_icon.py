"""(C) Generate Icarus's falling Icarus app and menu-bar icons on macOS."""
from pathlib import Path
import subprocess
import tempfile
from PIL import Image, ImageDraw

HERE = Path(__file__).parent


def draw_mark(size):
    # Resize only for platform icon sizes; preserve the generated art and alpha.
    image = Image.open(HERE / 'assets/icarus-falling (C).png').convert('RGBA')
    image.thumbnail((size,size), Image.Resampling.LANCZOS)
    result = Image.new('RGBA', (size,size))
    result.alpha_composite(image, ((size-image.width)//2, (size-image.height)//2))
    return result


def draw_app_icon(size):
    # Render larger, then reduce so the crescent stays smooth at small sizes.
    high = size * 3
    image = Image.new('RGBA', (high, high))
    d = ImageDraw.Draw(image)
    pad = round(high*.055)
    d.rounded_rectangle((pad,pad,high-pad,high-pad), radius=high*.22, fill=(22,22,23,255), outline=(99,99,101,255), width=max(1,high//160))
    mark = draw_mark(round(high*.78))
    image.alpha_composite(mark, ((high-mark.width)//2,(high-mark.height)//2))
    return image.resize((size,size), Image.Resampling.LANCZOS)


def build_icns():
    iconset = Path(tempfile.mkdtemp(prefix='Icarus (C)-')) / 'Icarus.iconset'
    iconset.mkdir()
    for size in [16,32,128,256,512]:
        for scale in [1,2]:
            suffix = '@2x' if scale == 2 else ''
            draw_app_icon(size*scale).save(iconset / f'icon_{size}x{size}{suffix}.png')
    subprocess.run(['iconutil','-c','icns',str(iconset),'-o',str(HERE/'icon.icns')],check=True)


if __name__ == '__main__':
    build_icns()
    draw_mark(128).save(HERE/'menubar_icon.png')
