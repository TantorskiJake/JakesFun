
public class CHangePurseDriver {

	public static void main(String[] args) 
	{
		ChangePurse purse1 = new ChangePurse();
		ChangePurse purse2 = new ChangePurse();
		ChangePurse purse3 = new ChangePurse(10,11,12);
		
		
		purse1.addDimes(6);
		purse1.addNickels(7);
		purse1.addQuarters(75);
		
		purse2.addDimes(0);
		purse2.addNickels(3);
		purse2.addQuarters(8);
		
		System.out.println("The total of purse 1 is: " + purse1.getTotal());
		System.out.println("The total of purse 2 is: " + purse2.getTotal());
		System.out.println("The total of purse 3 is: " + purse3.getTotal());
		System.out.println();
		System.out.println("The total amount in pennies in purse 1 is: " + purse1.totalInPennies());
		System.out.println("The total amount of dollars in purse 1 is: " + purse1.getDollars());
		System.out.println("The total amount of cents in purse 1 is: " + purse1.getCents());
		System.out.println();
		System.out.println("The total amount in pennies in purse 2 is: " + purse2.totalInPennies());
		System.out.println("The total amount of dollars in purse 2 is: " + purse2.getDollars());
		System.out.println("The total amount of cents in purse 2 is: " + purse2.getCents());
		System.out.println();
		System.out.println("The total amount in pennies in purse 3 is: " + purse3.totalInPennies());
		System.out.println("The total amount of dollars in purse 3 is: " + purse3.getDollars());
		System.out.println("The total amount of cents in purse 3 is: " + purse3.getCents());
	
	}

}
