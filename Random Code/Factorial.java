import java.util.*;

public class Factorial {

  public static void main(String[] args) {
    Scanner inputUser = new Scanner(System.in);
    int userInput = inputUser.nextInt();
    int answer = factor(userInput);
    System.out.print("The Factorial of " + userInput + " is: " + answer +"\n");
  }

  public static int factor(int num){
    if(num >=1){
      return num * factor(num - 1);
    }
    else
      return 1;

    }

}
