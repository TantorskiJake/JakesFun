import java.util.Random;


public class Chick extends Animal implements AnimalBehaviors
{
	Random rand = new Random();

		static int  n = (int)(Math.random()*2 + 1);
	public Chick()
	{
		
	super("Chick", mySound());
		
	}
	public static String mySound()
	{
		if(n == 1)
			return "Cheep";
		else
			return"Cluck";
	}

}
