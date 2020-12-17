import java.util.Scanner;
public class GuessingGame 
{

	public static void main(String[] args) 
	{
		int guess = 0;
		boolean correct = false;
		
		Scanner scanIt = new Scanner(System.in);
		
		int randomNum = (int) (20 * Math.random() + 1);
		
		while(!correct && guess < 5)
		{
			
			System.out.println("Guess a number between: 1- 20: ");
			int answer = scanIt.nextInt();
			
			if(randomNum == answer)
			{
				correct = true;
			}
			else
			{
				guess++;
				System.out.println("You have " + (5-guess) + " tries left");
			}
		}
		
		if(correct)
		{
			System.out.println("Nice job bud.");
		}
		else
		{
			System.out.println("Thats just embrassing.");
			System.out.println("The number was: " + randomNum);
		}

	}

}
