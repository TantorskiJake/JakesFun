
public class Animal implements AnimalBehaviors {
	
	private String myType;
	private String mySound;
	public Animal(String type, String sound)
	{
		myType = type;
		mySound = sound;
	}
	public String getSound()
	{
		return mySound;
	}
	public String getType()
	{
		return myType;
	}

}
