import java.util.Scanner;

public class randomNum 
{

	public static void main(String[] args) 
	{
		/*
		int num1,num2,num3;
		
		num1 = ((int)(11*Math.random()+10));
		num2 = ((int)(11*Math.random()+10));
		num3 = ((int)(11*Math.random()+10));
		
		System.out.print(num1+num2+num3 + " is the sum of: " + num1 + " " + num2 + " " +num3);
		
		
		
		num1 = ((int)(24*Math.random()+121));
		
		
		System.out.print(Math.sqrt(num1)+" is the square root of: " + num1);
		
		
		Scanner scan = new Scanner(System.in);
		
		System.out.print("Enter start variable: ");
		
		num1 = scan.nextInt();
		
		System.out.print("Enter end variable: ");
		
		num2 = scan.nextInt();
		
		num3 = ((int)(((num2-num1)+1)*Math.random()+num1));
		
		System.out.print(num3 + " is the random number generated.");*/
		
		
		
		int sValue, eValue;
		
		Scanner scan = new Scanner(System.in);
		
		System.out.print("Enter start variable: ");
		
		sValue = scan.nextInt();
		
		System.out.print("Enter end variable: ");
		
		eValue = scan.nextInt();
		
		System.out.println(randValue());
		
		
	}
		
	
		public static int randValue (int sV, int eV)
	{
			return (int)((eV-sV + 1) * Math.random()+sV);
		
		
		
		
	}

	
	
}


