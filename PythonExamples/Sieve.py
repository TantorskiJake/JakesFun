from math import isqrt


def primeLessThan(n: int) -> list[int]:
    if n <= 2:
        return []
    # At the beginning, set all values of the array to True
    isPrime = [True] * n
    isPrime[0] = False
    isPrime[1] = False
# the multples of i that are bigger than are equal to i squared
    for i in range(2, isqrt(n)):
        if isPrime[i]:
            for x in range(i * i, n, i):
                isPrime[x] = False

    return [i for i in range(n) if isPrime[i]]


if __name__ == "__main__":
    print(primeLessThan(586))
