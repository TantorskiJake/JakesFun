
def kiloToMiles():
    # Input Kilometers
    kilometers = float(input("Enter Kilometers: "))
    # Conversion Factor
    convFac = 0.621371
    # Calculate Miles
    miles = kilometers * convFac
    print('%0.2f Kilometers : %0.2f Miles' % (kilometers, miles))


def milesToKilo():
    # Input Miles
    miles = float(input("Enter Miles: "))
    # Conversion Factor
    convFac = 0.621371
    # Calculate Kilometers
    kilometers = miles / convFac
    print('%0.2f Miles : %0.2f Kilometers' % (miles, kilometers))


choice = raw_input("1: Kilometers to Miles 2. Miles to Kilometers: ")

if(choice == '1'):
    kiloToMiles()
    milesToKilo()
else:
    print("Invalid Input!")
