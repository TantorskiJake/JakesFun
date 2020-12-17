
/**
 * Name:
 * Date:		
 * Block:					
 */

//***************************************
//DRIVER PROGRAM CODE MAY NOT BE MODIFIED
//HOWEVER, DO PASTE RUN OUTPUT AT BOTTOM OF CODE AS COMMENT.
//***************************************

public class StaplerTester
{
    public static void main(String args[])
    {
		//create stapler objects
		Stapler test1 = new Stapler();
		Stapler test2 = new Stapler(25, 100, true);

		//initial status
		System.out.println("INITIAL STATUS");
		printStatus(test1, "test1");
		printStatus(test2, "test2");
		System.out.println();

		//Actions Taken On Staplers
		test1.staple();
		test1.staple();
		test2.staple();
		test2.staple();
		test1.openStapler();
		test1.addStaples(5000);
		test1.staple();
		test1.staple();
		test1.closeStapler();
		test1.staple();
		test1.openStapler();
		test2.openStapler();
		test2.addStaples(10);
		test2.openStapler();
		test2.addStaples(300);
		test2.staple();
		test2.closeStapler();
		test2.staple();
		
		//Status after Actions Taken
		System.out.println("STATUS AFTER ACTIONS");
		printStatus(test1, "test1");
		printStatus(test2, "test2");
		System.out.println();
		System.out.println();
		
		//Pass or Fail Testing
		System.out.println("ACTIONS TEST PASS/FAIL:   ");
		System.out.print("You = ");
		if(test1.numStaples() == 249 && test1.getCapacity() == 250 && test1.isClosed() == false
				&& test2.numStaples() == 99 && test2.getCapacity() == 100 && test2.isClosed() == true)
			System.out.println("Pass!  Hurray!");
		else
			System.out.println("Fail!  Try Again!  Check your Stapler Class");
		System.out.println();
		
    }

	//Prints Stapler Status.
	private static void printStatus(Stapler temp, String name)
	{
		System.out.print(name + " status:\t");
		System.out.print("staples = " + temp.numStaples() + "\t");
		System.out.print("capacity = " + temp.getCapacity() + "\t");
		System.out.print("closed = " + temp.isClosed());
		System.out.println();
	}

}

/*
PASTE RUN OUTPUT HERE:

Month entered = 8

*/
