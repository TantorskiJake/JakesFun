import collections, random

#Open Word.LST file and gather all of the 5 letter words into an array called words
with open("WORD.LST", "r") as f:
    words = [word.strip() for word in f.readlines() if len(word.strip()) == 5]

# As long as there are more than one word in the array keep looking
while len(words) > 1:
    # controls
    print("0 for ABSENT, 1 for PRESENT, and 2 for CORRECT ----------- Example: 20110")
    print("")
    print(f"Try {(guess := random.choice(words))!r}.")
    score = [int(char) for char in input(">>> ") if char in "012"]  # 0 for ABSENT, 1 for PRESENT, and 2 for CORRECT.
    words_ = []
    for word in words:
        pool = collections.Counter(c for c, sc in zip(word, score) if sc != 2)
        for w, g, sc in zip(word, guess, score):
            if ((sc == 2) != (w == g)) or (sc < 2 and bool(sc) != bool(pool[g])):
                break
            pool[g] -= sc == 1
        else:
            words_.append(word)  # No `break` was hit, so store the word.
    words = words_
print(words[0])
