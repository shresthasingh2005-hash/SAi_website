import sys
from PIL import Image

def make_white_transparent(image_path, output_path, threshold=240):
    img = Image.open(image_path).convert("RGBA")
    datas = img.getdata()

    newData = []
    for item in datas:
        # Check if the pixel is white-ish
        if item[0] > threshold and item[1] > threshold and item[2] > threshold:
            newData.append((255, 255, 255, 0)) # Fully transparent
        else:
            newData.append(item)

    img.putdata(newData)
    img.save(output_path, "PNG")

if __name__ == "__main__":
    make_white_transparent("public/avatar_sitting.jpg", "public/avatar_sitting.png")
    make_white_transparent("public/avatar_walking.jpg", "public/avatar_walking.png")
    print("Backgrounds removed!")
