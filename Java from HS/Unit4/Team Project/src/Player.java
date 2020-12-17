
public class Player 
{
	private String name;
	private String team;
	private int jerseyNumber;
	private double batAvg;
	
	public Player(String pname, String pteam, int pJerseyNumber)
	{
		name = pname;
		team = pteam;
		jerseyNumber = pJerseyNumber;
		batAvg = ((int) (801 * Math.random() + 100))/1000.00;
	}
	
	//toString method, every class, returns state of object
	public String toString()
	{
		return name + "\n" + team + "\n" + jerseyNumber + "\n"; 
	}
	
	
	public boolean equals(Player other)
	{
		if(this.name.equals(other.name) && this.team.equals(other.team))
			return true;
		else
			return false;	
	}
	
	public double getBatAvg()
	{
		return batAvg;
	}

	public String getname()
	{
		return name;
	}
	
}
						