import java.util.ArrayList;

public class PrisonArrayList 
{
	
	private ArrayList<Prisoner>pList;
	
	
	public PrisonArrayList()
	{
		pList = new ArrayList<Prisoner>();
		
	}
	public void addPrisoner(Prisoner p)
	{
		boolean found = false;
		int i = 0;
		while(!found)
		{
			if(pList.get(i)==null)
			{
				pList.get(i).equals(p);
				found = true;
			}
			i++;
		}

			
	}
	public String toString(Prisoner p)
	{
		return  p.getPrisonerName();
	}
	
	private void sortPrisoners()
	{
		Prisoner temp;
		for (int i=0; i<pList.size(); i++)
        {
            for (int j=0; j < pList.size(); j++) 
            {
                if((pList.get(i).getPrisonerName().compareTo(pList.get(j).getPrisonerName())>0))
                {
                	temp = pList.get(i);
                	pList.get(i).equals(pList.get(j));
                	pList.get(j).equals(temp);
                }
            }
        }
	}
	
	public String findPrisoner(String pname)
	{
		boolean found = false;
		sortPrisoners();
		for(int i=0;i<pList.size();i++)
		{
			if(pname.equals(pList.get(i).getPrisonerName()))
			{
				System.out.println("Prisoner: "+pList.get(i).getPrisonerName()+ "; Ship: "+pList.get(i).getShip()+ "; Cell #: "+pList.get(i).getCell());
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
	

}