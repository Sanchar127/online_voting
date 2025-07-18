'use client';
import { useState, useEffect } from "react";
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import Router, { useRouter } from "next/navigation";

export default function VotingPage() {
  const { data: session, status } = useSession();
  const [selectedMayorParty, setSelectedMayorParty] = useState("");
  const [selectedDeputyParty, setSelectedDeputyParty] = useState("");
  const [selectedMayor, setSelectedMayor] = useState(null);
  const [selectedDeputy, setSelectedDeputy] = useState(null);
  const [candidatesData, setCandidatesData] = useState([]);
  const [electionsData, setElectionsData] = useState([]);
  const [isVoting, setIsVoting] = useState(false);
  const router = useRouter();

  const nationalId = session?.user?.nationalId || '';
  const district = session?.user?.district || '';
  const municipality = session?.user?.municipality || '';
  const activeElection = session?.activeElection || null;

  useEffect(() => {
  const fetchCandidates = async () => {
    try {
      const response = await axios.get('/api/candidates/');
      const data = response.data;

      const electionCandidates = data.filter(candidate => {
        return candidate.electionId === activeElection?.electionId;
      });

      setCandidatesData(electionCandidates);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      toast.error("Failed to fetch candidates.");
    }
  };

  const fetchElections = async () => {
    try {
      const response = await axios.get('/api/elections');
      const elections = response.data.elections || [];

      if (Array.isArray(elections)) {
        const election = elections.find(election => election.electionId === activeElection?.electionId);
        if (election) {
          setElectionsData([election]);

          if (election.disabledMunicipalities.includes(municipality)) {
            toast.error("Voting is disabled in your municipality.");
            router.push('/');
          }
        }
      } else {
        console.error("Elections data is not an array", elections);
        toast.error("Failed to fetch valid elections data.");
      }
    } catch (error) {
      console.error("Error fetching elections:", error);
      toast.error("Failed to fetch elections.");
    }
  };

  fetchCandidates();
  fetchElections();
}, [activeElection?.electionId, municipality, router]);

  const normalizeString = (str) => str?.trim().toLowerCase() || '';

  // Filter candidates for the selected district and municipality from the active election only
  const filteredCandidates = candidatesData.filter(
    (candidate) =>
      normalizeString(candidate.district) === normalizeString(district) &&
      normalizeString(candidate.municipality) === normalizeString(municipality)
  );

  const handlePartySelection = (party, role) => {
    if (role === 'mayor') {
      setSelectedMayorParty(party);
      const mayor = filteredCandidates
        .flatMap(candidate => candidate.mayorCandidates)
        .find(mayor => mayor.party === party);
      setSelectedMayor(mayor || null);
    } else if (role === 'deputy') {
      setSelectedDeputyParty(party);
      const deputy = filteredCandidates
        .flatMap(candidate => candidate.deputyMayorCandidates)
        .find(deputy => deputy.party === party);
      setSelectedDeputy(deputy || null);
    }
  };

  const handleVote = async () => {
    if (!selectedMayor || !selectedDeputy) {
      toast.error("Please select both a Mayor and a Deputy Mayor.");
      return;
    }

    if (!district || !municipality || !nationalId || !activeElection?.electionId) {
      toast.error("Incomplete voter details. Please log in.");
      return;
    }

    setIsVoting(true);

    const voteData = {
      voterId: nationalId,
      district,
      municipality,
      electionId: activeElection?.electionId || "", // Include the electionId
      mayorId: selectedMayor?.candidateId || "",
      deputyMayorId: selectedDeputy?.candidateId || "",
      mayorParty: selectedMayorParty || "",
      deputyMayorParty: selectedDeputyParty || "",
    };

    try {
      const response = await axios.post('/api/vote', voteData);
      if (response.status === 200) {
        toast.success('Your vote has been successfully submitted!');
      } else {
        toast.error('There was an error submitting your vote.');
      }
    } catch (error) {
      toast.error('You have already cast your vote.');
    } finally {
      setIsVoting(false);
    }
  };

  if (status === 'loading') {
    return 'Loading...';
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r m-5 from-blue-50 to-blue-100 min-h-screen flex items-center justify-center p-6">
      <main className="bg-white shadow-2xl rounded-2xl w-full max-w-lg p-8">
        <Toaster />
        {activeElection && (
          <div className="mb-6 p-6 bg-gradient-to-r from-blue-300 to-blue-500 rounded-xl shadow-xl transform transition-transform hover:scale-105 duration-300 w-72 mx-auto">
            <p className="text-white font-semibold text-center text-lg">
              <strong className="text-2xl">Welcome to {activeElection.name}</strong>
            </p>
          </div>
        )}

        <h1 className="text-4xl font-extrabold text-center text-blue-700 mb-8">Cast Your Vote</h1>
        <p className="text-gray-600 text-center mb-6">
          Securely vote for your preferred Mayor and Deputy Mayor.
        </p>
        {activeElection && (
          <div className="mb-6">
            <p className="text-gray-700">
              <strong>Election ID:</strong>
              <input
                type="text"
                value={activeElection.electionId}
                readOnly
                className="w-full bg-gray-100 text-gray-700 p-4 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-400"
              />
            </p>
          </div>
        )}

        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">National ID</label>
          <input
            type="text"
            value={nationalId}
            readOnly
            className="w-full bg-gray-100 text-gray-700 p-4 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="mb-6">
          <p className="text-gray-700">
            <strong>District:</strong> {district || "Not available"}
          </p>
          <p className="text-gray-700">
            <strong>Municipality:</strong> {municipality || "Not available"}
          </p>
        </div>

        {filteredCandidates.length > 0 ? (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-blue-600 mb-4">Mayor Candidates</h2>
              <select
                value={selectedMayorParty}
                onChange={(e) => handlePartySelection(e.target.value, 'mayor')}
                className="w-full p-3 rounded-lg shadow-sm border border-gray-300 focus:ring-2 focus:ring-blue-400"
              >
                <option value="" disabled>Select a Mayor Party</option>
                {filteredCandidates.flatMap(candidate => candidate.mayorCandidates).map(mayor => (
                  <option key={mayor.candidateId} value={mayor.party}>
                    {mayor.party}
                  </option>
                ))}
              </select>
              {selectedMayor && (
                <p className="mt-3 text-center text-gray-800 font-medium">
                  {selectedMayor.name} ({selectedMayor.party})
                </p>
              )}
            </div>

            <div>
              <h2 className="text-xl font-bold text-blue-600 mb-4">Deputy Mayor Candidates</h2>
              <select
                value={selectedDeputyParty}
                onChange={(e) => handlePartySelection(e.target.value, 'deputy')}
                className="w-full p-3 rounded-lg shadow-sm border border-gray-300 focus:ring-2 focus:ring-blue-400"
              >
                <option value="" disabled>Select a Deputy Mayor Party</option>
                {filteredCandidates.flatMap(candidate => candidate.deputyMayorCandidates).map(deputy => (
                  <option key={deputy.candidateId} value={deputy.party}>
                    {deputy.party}
                  </option>
                ))}
              </select>
              {selectedDeputy && (
                <p className="mt-3 text-center text-gray-800 font-medium">
                  {selectedDeputy.name} ({selectedDeputy.party})
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-600 mb-6">No candidates found for your district and municipality.</p>
        )}

        <button
          onClick={handleVote}
          disabled={isVoting}
          className="w-full mt-6 bg-gradient-to-r from-blue-400 to-blue-500 text-white py-3 rounded-lg text-lg font-semibold hover:from-blue-500 hover:to-blue-600 focus:ring-4 focus:ring-blue-300 transition-transform transform hover:scale-105 duration-200"
        >
          {isVoting ? 'Submitting...' : 'Submit Vote'}
        </button>
      </main>
    </div>
  );
}
