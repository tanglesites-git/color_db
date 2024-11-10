def __complimentary_rgb(rgb):
    pass

def __complimentary_hex(hex):
    pass

def __complimentary_oklab(oklab):
    pass

def __complimentary_oklch(oklch):
    pass

def __complimentary_hwb(hwb):
    pass

def __complimentary_hsl(hsl):
    pass

def complimentary(value, type='rgb'):
    if type not in ['rgb', 'hex', 'oklab', 'oklch', 'hwb', 'hsl']:
        exit(0)

    if type == 'rgb':
        return __complimentary_rgb()

    if type == 'hex':
        return __complimentary_hex()
    
    if type == 'oklab':
        return __complimentary_oklab()
    
    if type == 'oklch':
        return __complimentary_oklch()
    
    if type == 'hwb':
        return __complimentary_hwb()
    
    if type == 'hsl':
        return __complimentary_hsl()
    
    return None
