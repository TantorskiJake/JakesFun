
public class PrisonerList 
{
	private Prisoner[] pList;
	private static int indx;
	
	public PrisonerList()
	{
		pList = new Prisoner [15];
		indx = 0;
	}
	public void addPrisoner(Prisoner p)
	{
		
		pList[indx] = p;
		indx++;
	}

			
	
	public String toString(Prisoner p)
	{
		return  p.getPrisonerName();
	}
	
	
	
	public String findPrisoner(String pname)
	{
		boolean found = false;
		
		sortPrisoners();
		
		for(int i=0;i<indx;i++)
		{
			if(pname.equals(pList[i].getPrisonerName()))
			{
				System.out.println("Prisoner: "+pList[i].getPrisonerName()+ "; Ship: "+pList[i].getShip()+ "; Cell #: "+pList[i].getCell());
				found = true;
			}
				
		}
		
		if(found)
			return "";
		else
		{
			System.out.println("not found");
			return "";
		}
	}
	
	public void sortPrisoners()
	{  
		Prisoner temp;
		for (int i = 0; i < indx; i++) 
		{
			for(int j = 1 ; j < indx-i-1 ; j++)
			{
				if(pList[j].getPrisonerName().compareTo(pList[j-1].getPrisonerName())<0)
				{
					temp = pList[j];
		            pList[j] = pList[j-1];
		            pList[j-1] = temp;
		        }
		     }
		}
	}
	

}