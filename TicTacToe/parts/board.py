# Use a dictionary to create our game board.
# A dictionary is a primitive data type in python which stores data in “key: value” format. and thus,
# we’ll create a dictionary of length 9 and each key will represent a block in the board
# and its corresponding value will represent the move made by a player.
# and we’ll create a function printBoard() which we can use every time we want to print the updated board in the game.

theBoard = {'7': ' ' , '8': ' ' , '9': ' ' ,
            '4': ' ' , '5': ' ' , '6': ' ' ,
            '1': ' ' , '2': ' ' , '3': ' ' }

def printBoard(board):
    print(board['7'] + '|' + board['8'] + '|' + board['9'])
    print('-+-+-')
    print(board['4'] + '|' + board['5'] + '|' + board['6'])
    print('-+-+-')
    print(board['1'] + '|' + board['2'] + '|' + board['3'])
