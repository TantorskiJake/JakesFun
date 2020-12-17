
public class HandDriver {

	public static void main(String[] args) 
	{
		Hand cards = new Hand();
		
		cards.addCard(new Card(1, 0));
		cards.addCard(new Card(7, 2));
		cards.addCard(new Card(4, 1));
		cards.addCard(new Card(2, 3));
		cards.addCard(new Card(9, 0));
		
		cards.printHand();
		cards.sortHand();
		cards.printHand();	}

}
