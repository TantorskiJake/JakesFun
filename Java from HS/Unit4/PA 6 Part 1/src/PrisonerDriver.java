import java.util.Scanner;

public class PrisonerDriver 
{
	public static void main(String[] args) 
	{
		Prisoner Kenobi = new Prisoner("Kenobi","Falcon","328");
		Prisoner Spock = new Prisoner("Spock","Enterprise","562");
		Prisoner Yoda = new Prisoner("Yoda","None","122");
		Prisoner Mudd = new Prisoner("Mudd","Pleasure Dome","222");
		Prisoner Khan = new Prisoner("Khan","Botany Bay","009");
		Prisoner Jetson = new Prisoner("Jetson","Astrofly","468");
		Prisoner Rogers = new Prisoner("Rogers","Galaxy 2","727");
		Prisoner Koenig = new Prisoner("Koenig","Alpher","999");
		Prisoner Adama = new Prisoner("Adama","Galactica","987");
		Prisoner Who = new Prisoner("Who","Tardis","585");
		
		PrisonerList list = new PrisonerList();
		list.addPrisoner(Kenobi);
		list.addPrisoner(Spock);
		list.addPrisoner(Yoda);
		list.addPrisoner(Mudd);
		list.addPrisoner(Khan);
		list.addPrisoner(Jetson);
		list.addPrisoner(Rogers);
		list.addPrisoner(Koenig);
		list.addPrisoner(Adama);
		list.addPrisoner(Who);
		
		Scanner scan = new Scanner(System.in);
		
		System.out.println("Find:" );
		String pname =scan.nextLine();
		
		list.findPrisoner(pname);		
	}

}
