import java.util.Scanner;


public class CharCount 
{

	public static void main(String[] args) 
	{
		String phrase;		//a string of characters
		int countBlank;	
		int aCount;	
		int eCount;	
		int sCount;	
		int tCount;	//keeps track of number of blank (spaces) in the phrase
		char ch;			//an individual character in the string
		
		Scanner scanIt = new Scanner(System.in);

		//print a program header
		System.out.println();
		System.out.print("Character Counter");
		System.out.println();
		
		//Read in a string
		System.out.print("Enter a sentence or phrase: "); 
		phrase = scanIt.nextLine();
		
		//Initialize counts
		countBlank = 0;
		aCount = 0;
		eCount = 0;
		sCount = 0;
		tCount = 0;
		//a for loop to go through the string character by character and count
		//the blank spaces, a's, e's, s's and t's (either capital or lowercase counts as 1)
		for( int i = 0; i <= phrase.length()-1; i++)
		{
			if(phrase.charAt(i)== ' ')
				countBlank++;
			if(phrase.charAt(i)== 'a')
				aCount++;
			if(phrase.charAt(i)== 'e')
				eCount++;
			if(phrase.charAt(i)== 's')
				sCount++;
			if(phrase.charAt(i)== 't')
				tCount++;
		}
		
		//print the results, only blank spaces is printed for you.  Need to add more
		System.out.println();
		System.out.println("Number of blank spaces: " + countBlank);
		System.out.println("Number of a: " + aCount);
		System.out.println("Number of e: " + eCount);
		System.out.println("Number of s: " + sCount);
		System.out.println("Number of t: " + tCount);
		System.out.println();
		
	}

}
