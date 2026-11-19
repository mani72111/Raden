#!/usr/bin/env python3
# Hallo Welt mit farbigen Buchstaben (ANSI-Farben im Terminal)

FARBEN = [31, 33, 32, 36, 34, 35]  # rot, gelb, gruen, cyan, blau, magenta
text = "Hallo Hallo Welt!"

ausgabe = ""
i = 0
for zeichen in text:
    if zeichen == " ":
        ausgabe += " "
    else:
        ausgabe += f"\033[1;{FARBEN[i % len(FARBEN)]}m{zeichen}"
        i += 1

print(ausgabe + "\033[0m")