// Quick script to add sample member data to localStorage for testing
const sampleMembers = [
    {
        id: "1",
        fullName: "John Doe",
        age: "35",
        dob: "1988-05-15",
        residence: "Accra",
        gpsAddress: "GA-123-4567",
        phoneNumber: "0244123456",
        altPhoneNumber: "0201234567",
        nationality: "Ghanaian",
        maritalStatus: "Married",
        joiningDate: "2020-01-15",
        avatar: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: "2",
        fullName: "Jane Smith",
        age: "28",
        dob: "1995-08-22",
        residence: "Kumasi",
        gpsAddress: "AK-456-7890",
        phoneNumber: "0554987654",
        altPhoneNumber: "",
        nationality: "Ghanaian",
        maritalStatus: "Single",
        joiningDate: "2021-03-10",
        avatar: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: "3",
        fullName: "Michael Johnson",
        age: "42",
        dob: "1981-12-03",
        residence: "Tema",
        gpsAddress: "GT-789-0123",
        phoneNumber: "0208765432",
        altPhoneNumber: "0244567890",
        nationality: "Ghanaian",
        maritalStatus: "Divorced",
        joiningDate: "2019-06-20",
        avatar: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

// Save to localStorage
localStorage.setItem('church_members', JSON.stringify(sampleMembers));
console.log('Sample members added to localStorage!');
console.log('Reload the page to see the members.');
