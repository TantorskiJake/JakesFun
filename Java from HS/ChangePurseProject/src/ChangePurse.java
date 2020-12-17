import java.text.DecimalFormat;
public class ChangePurse 
{
	
	//constants
	private static final double NICKEL_VALUE = .05;
	private static final double DIME_VALUE = .1;
	private static final double QUARTER_VALUE = .25;
	
	
	
	
	//instant variables - keep track of states in class!
	private int nickels;
	private int dimes;
	private int quarters;
	
	// default constructor
	public ChangePurse()
	{
		nickels = 0;
		dimes = 0;
		quarters = 0;
		
	}
	//constructor for instance variable that is not 0
	public ChangePurse(int n, int d, int q)
	{
		nickels=n;
		dimes = d;
		quarters = q;
	}
	
	//mutator method
	
	//adds nickels,dimes and quarters to instance variable
	public void  addNickels(int count)
	{
		nickels = nickels + count;
	}
	
	public void  addDimes(int count)
	{
		dimes = dimes + count;
	}
	
	public void  addQuarters(int count)
	{
		quarters = quarters + count;
	}
	
	//accessor methods
	public double getTotal()
	{
		DecimalFormat fmt = new DecimalFormat("0.##");
		
		return Double.parseDouble(fmt.format(nickels * NICKEL_VALUE + dimes * DIME_VALUE + quarters * QUARTER_VALUE));
	}
	
	public int totalInPennies()
	{
		
		return (int) (getTotal()*100);
	}
	public int getDollars()
	{
		
		return (int) ((getTotal()*100))/100;
	}
	public int getCents()
	{
		
		return (int) ((getTotal()*100)%100);
	}
	
	
	
	
	
	
}
