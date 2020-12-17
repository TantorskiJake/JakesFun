
public class Player 
{
	private String name;
	private String team;
	private int jerseyNumber;
	
	public Player(String pname, String pteam, int pJerseyNumber)
	{
		name = pname;
		team = pteam;
		jerseyNumber = pJerseyNumber;
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
	

}
						