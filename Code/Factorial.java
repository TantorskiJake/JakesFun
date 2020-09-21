//Jake Tantorski
import java.util.*;

public class Factorial {

  public static void main(String[] args) {
    int input = 5;
    int answer = factor(input);
    System.out.print("The Factorial of " + input + " is: " + answer);
  }

  public static int factor(int num){
    if(num >=1){
      return num * factor(num - 1);
    }
    else
      return 1;

    }

}
