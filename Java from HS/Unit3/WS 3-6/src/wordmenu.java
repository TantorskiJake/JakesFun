import java. util. Scanner;
import java.text.DecimalFormat;

public class wordmenu 
{

	public static void main(String[] args) 
	{
		/*
		DecimalFormat fmt = new DecimalFormat("0.###");
		int input ;
		String word;
		
		//This is the Menu
		System.out.println("CODE          FUNCTION");
		System.out.println(" 1         Take away last letter");
		System.out.println(" 2         Add last letter");
		System.out.println(" 3         Take away first letter");
		System.out.println(" 4         Write word vertically");
		
		System.out.println(" 5         Exit Program");
		System.out.println(" ");
		

		System.out.print("Choose a Function: ");
		Scanner scan = new Scanner(System.in);
		input = scan.nextInt();
		
		if(input == 1)
		{
			System.out.print("Enter a word:");
			Scanner scan3 = new Scanner(System.in);
			word = scan3.nextLine();
		
			for(int i = word.length(); i >= 0;  i--) 
			{
                
			    System.out.println(word.substring(0,i));
			}
			    
		}
		if(input == 2)
		{
			System.out.print("Enter a word:");
			Scanner scan2 = new Scanner(System.in);
			word = scan2.nextLine();
			
			for(int i = 1; i <= word.length(); i++) 
			{
			    System.out.println(word.substring(0, i));
			}
		}
		if(input == 3)
		{
			System.out.print("Enter a word:");
			Scanner scan1 = new Scanner(System.in);
			word = scan1.nextLine();
		
			for(int i = 0; i < word.length(); i++) 
			{
			    System.out.println(word.substring(i));
			}
			    
		}
		if(input == 4)
		{
			System.out.print("Enter a word:");
			Scanner scan4 = new Scanner(System.in);
			word = scan4.nextLine();
		
			 for (int i=0; i<word.length(); i++)
			 {
		            System.out.println(word.charAt(i));
			 }
		}
	}
}




			 
			//#2 
		
			DecimalFormat fmt = new DecimalFormat("0.###");
			int spaceCount = 1;
			String sent;
			
			System.out.print("Enter a sentence:");
			Scanner scan = new Scanner(System.in);
			sent = scan.nextLine();
			for(int i = 0; i <sent.length(); i++)
			{
				if(sent.charAt(i)==' ')
					spaceCount++;
			}
			System.out.println("There are " + spaceCount + " words in that sentence!");
			*/
		
		//#3
		int num ;
		
        int sum = 0;
        
        System.out.print("Enter a positive number: ");
		Scanner scan = new Scanner(System.in);
		num = scan.nextInt(); 
        while (num > 0) 
        {
            sum = sum + num % 10;
            num = num / 10;
        }
        System.out.println("The sum of the digits are: " + sum);
		
	

/*
		//#4
			System.out.print("Enter your name: ");
			Scanner scan = new Scanner(System.in);
			String name = scan.nextLine();
			
			for( int i = name.length()-1; i>-1; i--)
			{
				System.out.print(name.substring(i,i+1));
			}
			
			
			*/
			
			
			
	}
}
			 
			 
			 
			 
			 
			 
			 
			 
			 
			 