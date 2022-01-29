# Now, in the main function, we’ll first take the input from the player
# and check if the input is a valid move or not.
# If the block that player requests to move to is valid,
# we’ll fill that block else we’ll ask the user to choose another block.

def game():

    turn = 'X'
    count = 0

    for i in range(10):
            printBoard(theBoard)
            print("It's your turn," + turn + ".Move to which place?")

            move = input()

            if theBoard[move] == ' ':
                theBoard[move] = turn
                count += 1
            else:
                print("That place is already filled.\nMove to which place?")
                continue
