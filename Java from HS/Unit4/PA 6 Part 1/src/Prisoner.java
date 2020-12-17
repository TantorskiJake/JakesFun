

public class Prisoner 
{
	private String prisonerName;
	private String prisonerShip;
	private String cellNumber;
	
	
	public Prisoner (String pName, String pShip, String pCell)
	{
		prisonerName = pName;
		prisonerShip = pShip;
		cellNumber = pCell;
	}
	
	public String getPrisonerName()
	{
		return prisonerName;
	}
	
	public String getShip()
	{
		return prisonerShip;
	}
	
	public String getCell()
	{
		return cellNumber;
	}
}