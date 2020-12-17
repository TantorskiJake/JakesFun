

import java.util.Scanner;



public class StringManips 
{

	public static void main(String[] args) 
	{
		Scanner scanIt = new Scanner(System.in);			//object for Scanner class to access methods.
		
		
		String phrase = "This is a string test";
		String middle3;
		String city;
		String state;
		int phraseLength;	//number of characters in the phrase
		int middleIndex;	//index of the middle character in the string
		String firstHalf;	//first half of the phrase
		String secondHalf;	//second half of the phrase String
		String switchedPhrase;	//a new phrase with original halves switched
		
		//computer the length and middle index of the phrase
		phraseLength = phrase.length();
		middleIndex = phraseLength/2;
		middle3  = phrase.substring(middleIndex-1,middleIndex+2);
		//get the substring for each half of the phrase
		firstHalf = phrase.substring(0, middleIndex);
		secondHalf = phrase.substring(middleIndex, phraseLength);
		
		//concatenate the firstHalf at the end of the secondHalf
		switchedPhrase = secondHalf + firstHalf;
		switchedPhrase = switchedPhrase.replace(' ', '*' );
		
		//print the information about the phrase
		System.out.println();
		System.out.println("Original phrase: " + phrase);
		System.out.println("Length of the phrase: " +  phraseLength + " characters");
		System.out.println ("Character at the middle index: " + phrase.charAt(middleIndex));
		System.out.println("Switched phrase: " + switchedPhrase);
		System.out.println("The middle 3 characters are: " + middle3);
		System.out.print("Enter your home city: ");
		city = scanIt.nextLine();
		System.out.print("Enter your home state: ");
		state = scanIt.nextLine();
		
		System.out.println(state.toUpperCase() + city.toLowerCase() + state.toUpperCase());
		
		
		
		
		
			System.out.println();

	}

	

}


