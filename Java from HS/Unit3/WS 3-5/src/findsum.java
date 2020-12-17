import java.util.Scanner;
public class findsum 
{

	public static void main(String[] args) 
	{
		Scanner scanner = new Scanner (System.in);
		int sum = 0;
		int input;
		System.out.println("Enter a number: ");
		input =scanner.nextInt();
		
		if(input<2)
			System.out.println("Number is less than 2");
			for(int i = 2; i<=input; i= i+2)
				sum += i;
		System.out.println(sum);
	}

}
