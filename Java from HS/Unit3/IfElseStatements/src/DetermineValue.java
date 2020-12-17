//JAke Tantorski
//WS 3 -1 
import  java.util.Scanner;
public class DetermineValue {

	public static void main(String[] args) 
	{
		
		//Problem 1
		
		int num;
		
		Scanner scan = new Scanner(System.in);
		System.out.println("Enter a number: ");
		 num = scan.nextInt();
		 
		 if (num != 0)
		 {
		 	if(num>0)
		 		System.out.println("Your number is positive!");
		 	else
		 		System.out.println("Your number is negavtive!");
		 }
		 else
			 System.out.println("Your number is zero!");
		 
		 
		 	
		 //Problem 2	
		 	
		 /*	
		int age;
		
		Scanner scan = new Scanner(System.in);
		System.out.println("Enter your age: ");
		 age = scan.nextInt();
		
		 if(age<13)
		 {
			 System.out.println("The cost of your ticket is $5.25");
			 
		 }
		 else
			 System.out.println("The cost of your ticket is $6.50");
		 
		
		*/
		
		
		
		
		
	}

}
