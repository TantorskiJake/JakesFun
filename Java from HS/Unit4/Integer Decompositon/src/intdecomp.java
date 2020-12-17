import java.util.Scanner;

public class intdecomp {

	public static void main(String[] args) 
	{
		int input;
		Scanner scan = new Scanner(System.in);
		
		System.out.print("Enter an integer value: ");
		input = scan.nextInt();
		
		for( int i = 1; i < input-1; i++)
		{
			for(int k = 2; k < input -1; k++)
			{
				input - k + i;
			}
		}
		
		
		
		
		
		
		
	}

}
