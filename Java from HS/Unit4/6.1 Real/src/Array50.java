import java.util.Scanner;

public class Array50 {

	public static void main(String[] args) {
		int input;
		Scanner scan = new Scanner(System.in);
		
		input = scan.nextInt();
		
		int[] counter = new int[51];
		
		for(int i = 0; i <counter.length; i++)
		{
			counter[i] = 0;
		}
		while(input != -1)
		{
			counter[input]++;
			System.out.println("Enter a different number or -1 if complete!");
			input = scan.nextInt();
			if( input < -1&& input > 50)
			{
				System.out.println("Entera different number or -1 if complete!");
				input = scan.nextInt();	
			}
		}
		for( int i = 0; i<counter.length; i++)
		{
			System.out.println("The number" + i + " was entered in " + counter[i] +  "times");
			
		}
	}

}
