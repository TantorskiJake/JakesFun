import java.util.Scanner;

public class poem 
{

	public static void main(String[] args) 
	{
		int input; 
		Scanner scan = new Scanner(System.in);
		
		System.out.println("Enter a number 1-10 (or 0 to quit): ");
		input = scan.nextInt();
		if(input == 0)
			System.out.println("Bye");
		if(input >= 1)
		{
			if(input<=2)
				System.out.println("Buckle your shoe");
		}
		if(input >= 3)
		{
			if(input<=4)
				System.out.println("Shut the Door");
		}
		if(input >= 5)
		{
			if(input<=6)
				System.out.println("Pick up Sticks");
		}
		if(input >= 7)
		{
			if(input<=8)
				System.out.println("Lay them Straight");
		}
		if(input >= 9)
		{
			if(input<=10)
				System.out.println("A Big Fat Hen");
		}
		
		
	}

}
