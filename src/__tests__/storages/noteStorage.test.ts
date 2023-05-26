import { mergeNotes } from "../../storages/utils";

describe("mergeNotes", () => {
  it("空のノート", () => {
    const notesAMap = {
      1: [
        {
          id: 1,
          title: "Note1",
          description: "Note1 description",
          page_info_id: 1,
          created_at: "2023-05-23T12:02:08.566Z",
          updated_at: "2023-05-23T12:16:45.304Z",
        },
      ],
    };
    const noteBMap = {};
    const expectedNote = {
      1: [
        {
          id: 1,
          title: "Note1",
          description: "Note1 description",
          page_info_id: 1,
          created_at: "2023-05-23T12:02:08.566Z",
          updated_at: "2023-05-23T12:16:45.304Z",
        },
      ],
    };

    const result = mergeNotes(notesAMap, noteBMap);
    expect(result).toEqual(expectedNote);
  });

  it("合算", () => {
    const notesAMap = {
      1: [
        {
          id: 1,
          title: "Note1",
          description: "Note1 description",
          page_info_id: 1,
          created_at: "2023-05-23T12:02:08.566Z",
          updated_at: "2023-05-23T12:16:45.304Z",
        },
        {
          id: 2,
          title: "Note2",
          description: "Note2 description",
          page_info_id: 1,
          created_at: "2023-05-23T12:03:06.370Z",
          updated_at: "2023-05-23T12:11:03.703Z",
        },
      ],
    };
    const noteBMap = {
      2: [
        {
          id: 3,
          title: "Note3",
          description: "Note3 description",
          page_info_id: 2,
          created_at: "2023-05-24T12:02:08.566Z",
          updated_at: "2023-05-24T12:16:45.304Z",
        },
        {
          id: 4,
          title: "Note4",
          description: "Note4 description",
          page_info_id: 2,
          created_at: "2023-05-25T12:03:06.370Z",
          updated_at: "2023-05-25T12:11:03.703Z",
        },
      ],
    };
    const expectedNote = {
      1: [
        {
          id: 1,
          title: "Note1",
          description: "Note1 description",
          page_info_id: 1,
          created_at: "2023-05-23T12:02:08.566Z",
          updated_at: "2023-05-23T12:16:45.304Z",
        },
        {
          id: 2,
          title: "Note2",
          description: "Note2 description",
          page_info_id: 1,
          created_at: "2023-05-23T12:03:06.370Z",
          updated_at: "2023-05-23T12:11:03.703Z",
        },
      ],
      2: [
        {
          id: 3,
          title: "Note3",
          description: "Note3 description",
          page_info_id: 2,
          created_at: "2023-05-24T12:02:08.566Z",
          updated_at: "2023-05-24T12:16:45.304Z",
        },
        {
          id: 4,
          title: "Note4",
          description: "Note4 description",
          page_info_id: 2,
          created_at: "2023-05-25T12:03:06.370Z",
          updated_at: "2023-05-25T12:11:03.703Z",
        },
      ],
    };

    const result = mergeNotes(notesAMap, noteBMap);
    expect(result).toEqual(expectedNote);
  });

  it("マージ", () => {
    const notesAMap = {
      1: [
        {
          id: 1,
          title: "Note1",
          description: "Note1 description",
          page_info_id: 1,
          created_at: "2023-05-23T12:02:08.566Z",
          updated_at: "2023-05-23T12:16:45.304Z",
        },
        {
          id: 2,
          title: "Note2",
          description: "Note2 description",
          page_info_id: 1,
          created_at: "2023-05-23T12:03:06.370Z",
          updated_at: "2023-05-23T12:11:03.703Z",
        },
      ],
    };
    const noteBMap = {
      1: [
        {
          id: 1,
          title: "edited",
          description: "edited",
          page_info_id: 1,
          created_at: "2023-05-23T12:02:08.566Z",
          updated_at: "2023-05-23T12:16:46.304Z",
        },
        {
          id: 3,
          title: "Note3",
          description: "Note3 description",
          page_info_id: 2,
          created_at: "2023-05-24T12:02:08.566Z",
          updated_at: "2023-05-24T12:16:45.304Z",
        },
      ],
    };
    const expectedNote = {
      1: [
        {
          id: 1,
          title: "edited",
          description: "edited",
          page_info_id: 1,
          created_at: "2023-05-23T12:02:08.566Z",
          updated_at: "2023-05-23T12:16:46.304Z",
        },
        {
          id: 2,
          title: "Note2",
          description: "Note2 description",
          page_info_id: 1,
          created_at: "2023-05-23T12:03:06.370Z",
          updated_at: "2023-05-23T12:11:03.703Z",
        },
        {
          id: 3,
          title: "Note3",
          description: "Note3 description",
          page_info_id: 2,
          created_at: "2023-05-24T12:02:08.566Z",
          updated_at: "2023-05-24T12:16:45.304Z",
        },
      ],
    };

    const result = mergeNotes(notesAMap, noteBMap);
    expect(result).toEqual(expectedNote);
  });
});
