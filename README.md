# Color Spaces

## Table of Content
- [Convert Hex to RGB](#convert-hex-to-rgb)
- [Convert RGB to HEX](#converting-rgb-to-hex)

## Convert Hex to RGB

#### `Given a hex value` #b5c612

> First step is to remove the `#` character.

```python
hex_value = "#b5c612"
hex_value = hex_value.lstrip()

print(hex_value) # b5c612
```

> Next step is to split the string `b5c612`

```python
hex_value_list = [int(x, 16) for x in list(hex_value)]

print(hex_value_list) # [11, 5, 12, 6, 1, 2]
```
> The formula we are looking for here is

$$X = (16\times x) + y$$

> Where $X$ is one of the values `R`, `G`, or `B`. And $$x \in [11, 5, 12, 6, 1, 2] \wedge index(x) \equiv 0 \mod 2$$ and $$y \in [11, 5, 12, 6, 1, 2] \wedge index(y) \equiv 1 \mod 2$$ Where $index(x)$ is read `index of x`. That is math-speak for in the equation above, x represents every element in the list whose index $(0-5)$ is $0$ Modulus $2$. We are looking for the collection of values, namely, $x$ such that when we add the index of $x$ and $2$ and then divide the sum by 2 the remainder is always $0$. Likewise, we need a second collection such that when we add the value of $y$ and $2$ and then divide the sum by $2$ the remainder is always $1$. 

#### `The Exciting bit =>`
$$\frac{0 + 2}{2}=1^{R=0}$$
$$\frac{1 + 2}{2}=1^{R=1}$$
$$\frac{2 + 2}{2}=2^{R=0}$$
$$\frac{3 + 2}{2}=2^{R=1}$$
$$\frac{4 + 2}{2}=3^{R=0}$$
$$\frac{5 + 2}{2}=3^{R=1}$$

> The value of $x$ is every even index. And $y$ is every odd index. Where $0$ is even and $1$ is odd. The values of the even indexes are:
$$Even \longrightarrow [11, 12, 1]$$
> The values of the odd indexes are:
$$Odd \longrightarrow [5, 6, 2]$$

> With that bit out of the way, the resulting `Red`, `Green` and `Blue` values are given below:

$$R = (16 \times 11) + 5 = 181$$
$$G = (16 \times 12) + 6 = 198$$
$$B = (16 \times 1) + 2 = 18$$

> This gives us the value `rgb(181, 198, 18)` which is arguably a distasteful puke color. But I am color deficient so who knows. In python it might look like this:

```python
def hex_to_srgb(hex_color):
    hex_color = hex_color.lstrip('#')
    return [int(hex_color[i:i+2], 16) / 255.0 for i in (0, 2, 4)]
```

## Converting RGB to Hex