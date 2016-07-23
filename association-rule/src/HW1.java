package hw1;

import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Observable;
import java.util.Observer;
import java.util.StringTokenizer;

/**
 * Datasets contains integers (>=0) separated by spaces, one transaction by
 * line, e.g. 1 2 3 0 9 1 9
 * 
 * Usage with the command line : $ java hw1.HW1 fileName support confidence 
 * $ java hw1.HW1 hw1.dat 0.5 0.6
 * 
 * result: association_rule_mining.txt
 * 
 * @author DarrenChang, 2015
 */
public class HW1 implements Observer {

	double confidence;
	double minSupport;
	String fileName;
	List<StrongRule> rules = new ArrayList<HW1.StrongRule>();

	public static void main(String[] args) throws Exception {

		String fileName = "hw1.dat";
		double minSupport = 0.5;
		double confidence = 0.6;
		
//		args = new String[] { fileName, String.valueOf(minSupport),
//				String.valueOf(confidence) };
		new HW1(args);

	}

	public HW1(String args[]) throws Exception {
		// setting data file
		if (args.length != 0)
			this.fileName = args[0];
		else
			this.fileName = "hw1.dat"; // default

		// setting minsupport
		if (args.length >= 2)
			this.minSupport = (Double.valueOf(args[1]).doubleValue());
		else
			this.minSupport = .6;// by default
		if (this.minSupport > 1 || this.minSupport < 0)
			throw new Exception("minSupport: bad value");
		
		if (args.length >= 3)
			this.confidence = (Double.valueOf(args[2]).doubleValue());
		else
			this.confidence = 0.6;
		
		new Apriori(args, this);

	}

	@Override
	public void update(Observable o, Object arg) {
		int[] itemset = (int[]) arg;
		if (itemset.length > 1) {
			miningAssociationRule(itemset);
		}

	}

	private void miningAssociationRule(int[] itemset) {

		for (int subsetSize = 1; subsetSize < itemset.length; subsetSize++) {
			List<Integer> itemlist = new ArrayList<Integer>();
			for (int i = 0; i < itemset.length; i++) {
				itemlist.add(itemset[i]);
			}

			OrderedPowerSet<Integer> set = new OrderedPowerSet<Integer>(
					itemlist);
			List<LinkedHashSet<Integer>> result = set
					.getPermutationsList(subsetSize);

			System.out.println("subset A size: " + subsetSize);
			for (LinkedHashSet<Integer> permutation : result) {

				List<Integer> subset_B = new ArrayList<Integer>(itemlist);
				for (Integer i : permutation) {
					if (subset_B.contains(i))
						subset_B.remove(i);
				}
				List<Integer> subset_A = new ArrayList<Integer>(itemlist);
				for (Integer i : subset_B) {
					if (subset_A.contains(i))
						subset_A.remove(i);
				}
				// calculate confidence
				System.out.println("A:" + subset_A + ", B:" + subset_B);
				double itemSup = getSupport(itemlist);
				double ASup = getSupport(subset_A);
				double con = itemSup / ASup;
				System.out.println("confidence: " + con + "\n");

				if (con > confidence) {
					StrongRule rule = new StrongRule(subset_A, subset_B);
					rules.add(rule);
				}

			}
		}
		// save result as file
		try {
			PrintWriter out = new PrintWriter(
					"association_rule_mining_result.txt");
			out.println("min support: "+minSupport+", min confidence: "+ confidence);
			out.println("*** Strong rule ***");
			System.out.println("*** Strong rule ***");
			for (StrongRule r : rules) {
				System.out.println(r);
				out.println(r);
			}
			out.close();
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		}

	}

	private int getSupport(List<Integer> itemset) {

		int count = 0;

		BufferedReader data_in;
		try {
			data_in = new BufferedReader(new FileReader(fileName));

			List<Integer> tran;
			while (data_in.ready()) {
				String line = data_in.readLine();
				if (line.matches("\\s*"))
					continue; // be friendly with empty lines
				StringTokenizer t = new StringTokenizer(line, " ");
				tran = new ArrayList<Integer>();
				while (t.hasMoreTokens()) {
					int x = Integer.parseInt(t.nextToken());
					tran.add(x);
				}
				if (tran.containsAll(itemset))
					count++;
			}
			data_in.close();

		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return count;
	}

	static class StrongRule {
		List<Integer> setA;
		List<Integer> setB;

		public StrongRule(List<Integer> setA, List<Integer> setB) {
			this.setA = setA;
			this.setB = setB;
		}

		@Override
		public String toString() {
			return setA + "-->" + setB;
		}

	}
}