
public class PlayerDriver {

	public static void main(String[] args) 
	{
		Player[] bTeam = new Player[9];
		bTeam[0]= new Player ("Michael Jordan", "Red Barons" , 23);
		bTeam[1]= new Player ("Josh Reddick", "Red Barons" , 69);
		bTeam[2]= new Player ("Nenê", "Red Barons" , 98);
		bTeam[3]= new Player ("Ron", "Red Barons" , 13);
		bTeam[4]= new Player ("Don Mattingly", "Red Barons" , 54);
		bTeam[5]= new Player ("Sam", "Red Barons" , 45);
		bTeam[6]= new Player ("Rick", "Red Barons" , 9);
		bTeam[7]= new Player ("Harrison", "Red Barons" , 67);
		bTeam[8]= new Player ("Derek Jeter", "Red Barons" , 2);
		
		//print all batting averages less than 300
		
		
		for(Player p : bTeam)
		{
			if(p.getBatAvg()< .300)
			{
				System.out.println(p.toString());
				System.out.println("Batting Average: " + p.getBatAvg());
				System.out.println(" ");
			}
			
			
		}
		/*
		int i = 0;
		boolean found = false;
		
		while( i < 9 && !found)
		{
			if(bTeam[i].getname().equalsIgnoreCase("Derek Jeter"))
			{
				found = true;
				System.out.println(bTeam[i].toString());
				System.out.println("Batting Average: "+ bTeam[i].getBatAvg());
			}
			else
				i++;
		}
		if(!found)
			System.out.println("Derek Jeter not found");
			*/
	}

}
