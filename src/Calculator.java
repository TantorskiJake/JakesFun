import java.util.Scanner;

public class Calculator {

    public static void main(String[] args) {

    	double num1, num2;
        Scanner scanner = new Scanner(System.in);
        //Title Screen
        System.out.print("---------------------------------");
        System.out.print("CALCULATOR TI 85");
        System.out.println("---------------------------------");
        
        //Inputs
        System.out.print("Enter First Number:");
        num1 = scanner.nextDouble();
        System.out.print("Enter Second Number:");
        num2 = scanner.nextDouble();

        System.out.print("Enter an operator (+, -, *, /): ");
        char operator = scanner.next().charAt(0);

        scanner.close();
        
        double output;

        switch(operator)
        {
            //Addition
            case '+':
            	output = num1 + num2;
                break;
            //Subtraction
            case '-':
            	output = num1 - num2;
                break;
            //Multiplication
            case '*':
            	output = num1 * num2;
                break;
            //Division
            case '/':
            	output = num1 / num2;
                break;
            //Incorrect Input
            default:
                System.out.printf("You have entered wrong operator");
                return;
        }
        //Output
        System.out.println(num1+" "+operator+" "+num2+": "+output);
    }
}
