from json import loads


def create_final_json(color_index: dict):
    with open("store.json", "r", encoding="utf-8") as file:
        data = loads(file.read())

        for item in data:
            hex = item[0]
            value = item[1].upper()

            if hex not in color_index:
                color_index[hex] = [value]
            else:
                if value in color_index[hex]:
                    continue
                else:
                    if " " in value:
                        v1 = value
                        v1 = value.replace(" ", "")
                        if v1 in color_index[hex]:
                            continue
                        else:
                            color_index[hex].append(value)