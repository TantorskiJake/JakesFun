import java.util.Scanner;

public class polite 
{

	public static void main(String[] args) 
	{
		double  input;
		double counter = 0;
		
		Scanner scan = new Scanner(System.in);
		
		System.out.print("Enter a single positive integer value: ");
		input = scan.nextInt();
		counter = input;
			while ( counter > 1)
				counter/=2;
				if(counter  == 1 )
				{
					System.out.println(input + " is impolite");
				}
				else
				{
					System.out.println(input + " is polite ");
				}
				
	}

}
