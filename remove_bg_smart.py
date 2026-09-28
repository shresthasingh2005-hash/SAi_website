import sys
from PIL import Image

def remove_background_floodfill(image_path, output_path, tolerance=30):
    img = Image.open(image_path).convert("RGBA")
    width, height = img.size
    pixels = img.load()

    # The background color is assumed to be the top-left pixel
    bg_color = pixels[0, 0]
    
    # We will use a flood fill algorithm from the 4 corners
    visited = set()
    stack = [(0, 0), (width-1, 0), (0, height-1), (width-1, height-1)]
    
    def color_distance(c1, c2):
        return sum(abs(a - b) for a, b in zip(c1[:3], c2[:3]))
        
    while stack:
        x, y = stack.pop()
        if (x, y) in visited:
            continue
            
        if x < 0 or x >= width or y < 0 or y >= height:
            continue
            
        current_color = pixels[x, y]
        if color_distance(current_color, bg_color) <= tolerance:
            pixels[x, y] = (255, 255, 255, 0)
            visited.add((x, y))
            
            stack.append((x+1, y))
            stack.append((x-1, y))
            stack.append((x, y+1))
            stack.append((x, y-1))

    img.save(output_path, "PNG")

if __name__ == "__main__":
    remove_background_floodfill("public/avatar_sitting.jpg", "public/avatar_sitting.png")
    remove_background_floodfill("public/avatar_walking.jpg", "public/avatar_walking.png")
    print("Backgrounds removed using smart flood fill!")
