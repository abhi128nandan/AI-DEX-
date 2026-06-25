import sys

filepath = sys.argv[1]
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(len(lines)):
    if lines[i].startswith('pick '):
        lines[i] = lines[i].replace('pick ', 'reword ', 1)

with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(lines)
