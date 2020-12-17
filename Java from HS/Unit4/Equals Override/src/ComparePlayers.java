
public class ComparePlayers 
{

	public static void main(String[] args) 
	{
		Player emily  = new Player("Emily","Green Bay Packers", 34); //creating new object
		Player haulin  = new Player("Haulin","NY Giants", 85);
		Player richard  = new Player("Richard","Denver Broncos", 98);
		Player temp =  new Player("Richard","Denver Broncos", 65);
	
		
		if(richard.equals(temp))
			System.out.print("THE SAME");
		else
			System.out.print("Nope" );
		
		if(richard == temp)
			System.out.print("THE SAME");
		else
			System.out.print("Nope" );
		/*richard =emily;
		if(richard.equals(emily))
			System.out.print("True");
		else
			System.out.print("False");

		System.out.println(emily);
		System.out.println(haulin);
		System.out.println(richard);*/

	}

}
