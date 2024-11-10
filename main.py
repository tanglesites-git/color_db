from json import dumps
from common.file_paths import FINAL_FILE
from injestion import merge_color_dbs
from transformation import clean_data, create_final_json
from common import DATA
from common import STORE

def main():
    new_list = []
    color_list = []
    color_index = {}

    merge_color_dbs(new_list)
    clean_data(color_list)
    with open(DATA / STORE, "w", encoding="utf-8") as file:
        file.write(dumps(color_list, indent=2))

    create_final_json(color_index)
    with open(DATA / FINAL_FILE, "w", encoding="utf-8") as file:
        file.write(dumps(color_index, indent=2))

    print(f"Color List: {len(color_list)}")
    print(f"Color Index: {len(color_index)}")

if __name__ == '__main__':
    pass
    # hex_value = from_rgb_to_hex([255, 255, 255])
    # rgb_value = from_hex_to_rgb('#ffffff')
    # lrgb_value = from_rgb_to_linear([204, 30, 30])
    # lrgb1_value = from_hex_to_rgb_linear('#cc1e1e')
    # print(hex_value)
    # print(rgb_value)
    # print(lrgb_value)
    # print(lrgb1_value)