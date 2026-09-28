import sys
from PIL import Image

def remove_green_screen(image_path, output_path):
    img = Image.open(image_path).convert("RGBA")
    datas = img.getdata()

    newData = []
    for item in datas:
        r, g, b, a = item
        
        # Calculate how much greener the pixel is compared to red and blue
        greenness = g - max(r, b)
        
        if greenness > 40:
            # Solid green - make fully transparent
            newData.append((255, 255, 255, 0))
        elif greenness > 0:
            # Edge pixels (anti-aliasing) - make partially transparent
            alpha = int(255 - (greenness / 40.0) * 255)
            # Spill suppression: reduce green channel so edges don't look green
            new_g = min(g, max(r, b) + 10)
            newData.append((r, new_g, b, alpha))
        else:
            # Not green at all - keep as is
            newData.append(item)

    img.putdata(newData)
    img.save(output_path, "PNG")

if __name__ == "__main__":
    try:
        remove_green_screen("public/avatar_sitting.jpg", "public/avatar_sitting.png")
        remove_green_screen("public/avatar_walking.jpg", "public/avatar_walking.png")
        remove_green_screen("public/avatar_thinking.jpg", "public/avatar_thinking.png")
        print("Green screens removed perfectly with spill suppression!")
    except Exception as e:
        print(f"Error: {e}")
