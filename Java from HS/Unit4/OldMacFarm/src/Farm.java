
public class Farm 
{
	//notice the change in type.  You can use the Interface as a type too!!!!
	//to hold any type of object that implements it!!
	private AnimalBehaviors[] a = new AnimalBehaviors[3];  
	
	public Farm()
	{
		a[0] = new NamedCow("Elsie");   //creates a named cow
		a[1] = new Chick();
		a[2] = new Pig();
	}
	
	public void animalSounds()
	{
		/*since "any" is of type AnimalBehaviors, the object variable 
		can't see methods created directly in it's child classes.  
		So during the array traverse we can check the type of object using "instanceof".  
		If it's a NamedCow instance, we will cast "any" as type NamedCow 
		so it will be able to see the local method getName.  Check it out, below!*/

		for(AnimalBehaviors any: a)
		{
			if(any instanceof NamedCow)
				System.out.println("The Cow is known as " + ((NamedCow)any).getName());
			System.out.println(any.getType() + " goes " + any.getSound());
		}
		
	}
	
}
