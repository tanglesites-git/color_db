def from_hex_to_rgb(hex_value: str, string=False, with_comma=False):
    hex_value = hex_value.lstrip('#')
    hex_value_list = [int(x, 16) for x in list(hex_value)]
    R = (hex_value_list[0]*16) + hex_value_list[1]
    G = (hex_value_list[2]*16) + hex_value_list[3]
    B = (hex_value_list[4]*16) + hex_value_list[5]

    if string is False:
        return [R, G, B]
    
    if with_comma is False:
        return f'rgb({R} {G} {B})'
    return f'rgb({R}, {G}, {B})'
    
def from_rgb_to_hex(rgb):
    H1 = hex(int(rgb[0])).replace('0x', '')
    H2 = hex(int(rgb[1])).replace('0x', '')
    H3 = hex(int(rgb[2])).replace('0x', '')
    return f'#{H1}{H2}{H3}'


def __to_linear(c):
    if c <= 0.04045:
            return c / 12.92
    else:
        return ((c + 0.055) / 1.055) ** 2.4
    

def from_rgb_to_linear(rgb):
     return tuple(round(__to_linear(c/255) * 255) for c in rgb)

def from_hex_to_rgb_linear(hex):
     rgb = from_hex_to_rgb(hex)
     return from_rgb_to_linear(rgb)