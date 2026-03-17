import { useParams, useLocation, useNavigate } from "react-router-dom"; //to enable state
import { Link } from "react-router-dom";
import "./notebooks.css";
import logo from "../C5.png";
import "./toolbar.css";
import { useState, useRef, useMemo, useEffect } from "react";
import JoditEditor from "jodit-react";

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import { Modal, Button } from "react-bootstrap";

import { GhostaContainer, ghosta } from "react-ghosta";

import delete_icon from "./images/delete.png";
import edit_icon from "./images/edit_icon.png";

let yourUsername = "";

/* eslint-disable react/prop-types */
function GroupDropdown({
  group,
  notebook,
  isExpanded,
  toggleGroup,
  isSelectedGroup,
  selectedPage,
  readOnly,
  handlePageDragEnd,
  Groups,
}) {
  // State for editing group and page names
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [editingPageNumber, setEditingPageNumber] = useState(null);
  const [newPageName, setNewPageName] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeletePageModal, setshowDeletePageModal] = useState(false);

  const [groupToDelete, setGroupToDelete] = useState(null);
  const [pageToDelete, setPageToDelete] = useState(null);
  const [, setPageGroupToDelete] = useState(null);
  const [pageName, setPageName] = useState(null);
  const [pageInd, setPageInd] = useState(null);
  const navigate = useNavigate();

  const handleConfirmDeletePage = async () => {
    console.log("test");
    if (pageToDelete) {
      console.log(pageToDelete);
      console.log(group.group_id);
      const response = await fetch("backend/deletePage.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          group_id: group.group_id, // Send the group_id to delete
          page_num: pageToDelete,
        }),
      });

      const data = await response.json();
      if (data.success) {
        console.log(Groups);
        let update = false;
        for (let i = 0; i < group.pages.length; i++) {
          if (update !== true) {
            if (group.pages[i].page_number !== pageToDelete) {
              update = true;
              navigate(
                "/notebooks/" +
                  group.group_id +
                  "/" +
                  group.pages[i].page_number,
                {
                  state: {
                    notebook,
                    group: group.group_id,
                    page: group.pages[i].page_number,
                    readOnly,
                  },
                },
              );
            }
          }
        }
      } else {
        console.error("Failed to delete group");
      }
      setshowDeletePageModal(false); // Close the modal
    }
  };

  // Function to open the delete confirmation modal
  const handleDeletePage = (group, page) => {
    for (let i = 0; i < group.pages.length; i++) {
      if (group.pages[i].page_number === page) {
        setPageName(group.pages[i].page_name);
        setPageInd(i);
      }
    }
    setPageToDelete(page);
    setPageGroupToDelete(group);
    setshowDeletePageModal(true); // Show the modal
  };

  const handleConfirmDeleteGroup = async () => {
    if (groupToDelete) {
      const response = await fetch("backend/deleteGroup.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          group_id: groupToDelete.group_id, // Send the group_id to delete
        }),
      });

      const data = await response.json();
      if (data.success) {
        console.log(group);
        let update = false;
        for (let i = 0; i < Groups.length; i++) {
          if (update !== true) {
            if (Groups[i].group_id !== groupToDelete.group_id) {
              update = true;
              navigate(
                "/notebooks/" +
                  Groups[i].group_id +
                  "/" +
                  Groups[i].pages[0].page_number,
                {
                  state: {
                    notebook,
                    group: Groups[i].group_id,
                    page: Groups[i].pages[0].page_number,
                    readOnly,
                  },
                },
              );
            }
          }
        }
      } else {
        console.error("Failed to delete group");
      }
      setShowDeleteModal(false); // Close the modal
    }
  };

  // Function to open the delete confirmation modal
  const handleDeleteGroup = (group) => {
    setGroupToDelete(group);
    setShowDeleteModal(true); // Show the modal
  };

  // Handle editing group name
  const handleEditGroupName = async () => {
    const response = await fetch("backend/editGroupName.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        group_id: group.group_id,
        new_group_name: newGroupName,
      }),
    });

    const data = await response.json();
    if (data.success) {
      setEditingGroupId(null); // Exit edit mode
    } else {
      console.error("Failed to update group name");
    }
  };

  // Handle editing page name
  const handleEditPageName = async (pageNumber) => {
    const response = await fetch("backend/editPageName.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        group_id: group.group_id,
        new_page_name: newPageName,
        page_num: pageNumber,
      }),
    });

    const data = await response.json();
    if (data.success) {
      setEditingPageNumber(null); // Exit edit mode for page
    } else {
      console.error("Failed to update page name");
    }
  };

  return (
    <div className={`group ${isSelectedGroup ? "selected-group" : ""}`}>
      <Modal
        show={showDeletePageModal}
        onHide={() => setshowDeletePageModal(false)}
        centered
      >
        <Modal.Header>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this page? This action cannot be
          undone.
          <br />
          <strong>Page Name:</strong> {pageName}
          <br />
          <strong>Page location:</strong> {pageInd} from top
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setshowDeletePageModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirmDeletePage}
            style={{ backgroundColor: "red", borderColor: "red" }}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Display the group name and the list of page names */}
          Are you sure you want to delete this group? This action cannot be
          undone.
          <br />
          <strong>Group Name:</strong> &quot;{groupToDelete?.group_name}&quot;
          <br />
          <strong>Pages in this group:</strong>
          <ul>
            {/* Map through the pages and display each page name */}
            {groupToDelete?.pages?.map((page, index) => (
              <li key={index}>{page.page_name}</li>
            ))}
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirmDeleteGroup}
            style={{ backgroundColor: "red", borderColor: "red" }}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      <h1 className="clickableGroupName" onClick={toggleGroup}>
        {editingGroupId === group.group_id ? (
          <div>
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="New Group Name"
            />
            <button onClick={handleEditGroupName}>Save</button>
            <button onClick={() => setEditingGroupId(null)}>Cancel</button>
          </div>
        ) : (
          <>
            <span>{group.group_name}</span>

            {/* Render Edit button if NOT readOnly */}
            {!readOnly && isSelectedGroup && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent toggleGroup from being triggered
                    setEditingGroupId(group.group_id);
                    setNewGroupName(group.group_name); // Populate input with current group name
                  }}
                >
                  <img src={edit_icon} className="logos" alt="logo" />
                </button>
                {Groups.length !== 1 && (
                  <button onClick={() => handleDeleteGroup(group)}>
                    <img src={delete_icon} className="logos" alt="logo" />
                  </button>
                )}
              </>
            )}
          </>
        )}
      </h1>

      {isExpanded && (
        <DragDropContext onDragEnd={handlePageDragEnd}>
          <Droppable droppableId={`group-${group.group_id}`} type="page">
            {(provided) => (
              <ul ref={provided.innerRef} {...provided.droppableProps}>
                {group.pages.map((page, index) => (
                  <Draggable
                    key={page.page_number}
                    draggableId={`page-${page.page_number}`}
                    index={index}
                    isDragDisabled={readOnly}
                  >
                    {(provided) => (
                      <li
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <Link
                          to={`/notebooks/${group.group_id}/${page.page_number}`}
                          state={{ notebook, group, page, readOnly }}
                          className={
                            isSelectedGroup && page.page_number === selectedPage
                              ? "selected-page"
                              : ""
                          }
                        >
                          {editingPageNumber === page.page_number ? (
                            <div>
                              <input
                                type="text"
                                value={newPageName}
                                onChange={(e) => setNewPageName(e.target.value)}
                                placeholder="New Page Name"
                              />
                              <button
                                onClick={() =>
                                  handleEditPageName(page.page_number)
                                }
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingPageNumber(null)}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <span>{page.page_name || "Untitled Page"}</span>
                          )}

                          {/* Render Edit button if NOT readOnly */}
                          {!readOnly &&
                            isSelectedGroup &&
                            page.page_number === selectedPage &&
                            editingPageNumber !== page.page_number && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent parent toggle from being triggered
                                    setEditingPageNumber(page.page_number);
                                    setNewPageName(page.page_name); // Populate input with current page name
                                  }}
                                >
                                  <img
                                    src={edit_icon}
                                    className="logos"
                                    alt="logo"
                                  />
                                </button>
                                {group.pages.length !== 1 && (
                                  <button
                                    onClick={() =>
                                      handleDeletePage(group, selectedPage)
                                    }
                                  >
                                    <img
                                      src={delete_icon}
                                      className="logos"
                                      alt="logo"
                                    />
                                  </button>
                                )}
                              </>
                            )}
                        </Link>
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
}

function setCaretPosition(elem, caretPos) {
  elem.focus(); // Ensure the element is focused
  const range = document.createRange();
  const selection = window.getSelection();

  // Clear current selection
  selection.removeAllRanges();

  // Use TreeWalker to find the correct text node
  const walker = document.createTreeWalker(
    elem,
    NodeFilter.SHOW_TEXT,
    null,
    false,
  );
  let charCount = 0;
  let found = false;

  while (walker.nextNode()) {
    const node = walker.currentNode;
    const nextCharCount = charCount + node.length;

    if (nextCharCount >= caretPos) {
      range.setStart(node, caretPos - charCount);
      range.setEnd(node, caretPos - charCount);
      found = true;
      break;
    }

    charCount = nextCharCount;
  }

  if (found) {
    selection.addRange(range);
  }
}



// getCaretPosition: return [start, end] as offsets to elem.textContent that
//   correspond to the selected portion of text
//   (if start == end, caret is at given position and no text is selected)

function getCaretCharacterOffsetWithin(element) {
  var caretOffset = 0;
  var doc = element.ownerDocument || element.document;
  var win = doc.defaultView || doc.parentWindow;
  var sel;
  if (typeof win.getSelection !== "undefined") {
    sel = win.getSelection();
    if (sel.rangeCount > 0) {
      var range = win.getSelection().getRangeAt(0);
      var preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(element);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      caretOffset = preCaretRange.toString().length;
    }
  } else if ((sel = doc.selection) && sel.type !== "Control") {
    var textRange = sel.createRange();
    var preCaretTextRange = doc.body.createTextRange();
    preCaretTextRange.moveToElementText(element);
    preCaretTextRange.setEndPoint("EndToEnd", textRange);
    caretOffset = preCaretTextRange.text.length;
  }
  return caretOffset;
}

export function ToolTest() {
  const [lastModDate, setLastModDate] = useState(null);
  const [lastUser, setLastUser] = useState(null);

  const [connectedUsers, setConnectedUsers] = useState([]);

  const [groups, setGroups] = useState([]); // Store the groups of the current notebook

  const { groupID, pageNum } = useParams(); // Access current groupID and current pageNum from the URL
  const location = useLocation();
  const { notebook, readOnly } = location.state; // Access state passed during navigation

  const [notebooks, setNotebooks] = useState([]); // Store other user's notebooks
  const [sharedNotebooks, setSharedNotebooks] = useState([]); // Store shared notebooks

  const [notebookId, setNotebookId] = useState(null); // To store notebook ID
  const [expanded, setExpanded] = useState(Array(groups.length).fill(false));

  const [placeholder] = useState("");
  const editor = useRef(null);
  const navigate = useNavigate();
  const [content, setContent] = useState("");

  //sharing modal
  const [showAccessModal, setShowAccessModal] = useState(false); // State for showing modal
  const [sharedUsers, setSharedUsers] = useState([]); // To store users who already have access
  const [newUsername, setNewUsername] = useState(""); // Input field for new username
  const [errorMessage, setErrorMessage] = useState(""); // Error message for validation

  const timeoutRef = useRef(null); // Reference to store the current timeout ID

  const [pageName, setPageName] = useState(null);

  const cancelPolling = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null; // Reset the timeout reference
    }
  };

  const handleClose = () => {
    setShowAccessModal(false);
    setNewUsername("");
    setErrorMessage("");
  };
  const handleShow = () => {
    fetchSharedUsers(); // fetch shared users when modal opens
    setShowAccessModal(true);
  };

  //downloading modal
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState(".pdf");

  const handleDownloadClose = () => {
    setShowDownloadModal(false);
    setSelectedFormat(".pdf");
  };
  const handleDownloadShow = () => {
    setShowDownloadModal(true);
  };
  const handleFormatChange = (e) => {
    setSelectedFormat(e.target.value);
  };
  const handleDownload = () => {
    fetchContentForDownload().then((content) => {
      const filename = notebook.title; // Use the notebook title as the base filename

      if (selectedFormat === ".txt") {
        // Handle .txt download directly on the client side
        const blob = new Blob([content], { type: "text/plain" });
        const downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = `${filename}.txt`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      } else {
        // Handle PDF and DOCX download by sending a request to the backend
        const url =
          selectedFormat === ".pdf"
            ? "backend/generatePDF.php"
            : "backend/generateDOCX.php";

        // Send HTML content to backend PHP script for PDF or DOCX generation
        fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            htmlContent: content,
            filename: filename,
          }),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Failed to generate the file");
            }
            return response.blob();
          })
          .then((blob) => {
            // Trigger file download
            const downloadLink = document.createElement("a");
            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.download = `${filename}${selectedFormat}`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
          })
          .catch((error) => {
            console.error("Error downloading file:", error);
          });
      }
    });
    handleDownloadClose();
  };
  const fetchContentForDownload = async () => {
    const response = await fetch("backend/getPageContent.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pageid: pageNum, groupid: groupID }),
    });
    const data = await response.json();
    return data.content || ""; // Return the fetched content or empty if not found
  };

  const handleAddGroup = async () => {
    const username = getCookie("username");

    // Step 1: Add the group
    const response = await fetch("backend/addGroup.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        title: notebook.title,
        group_name: "Untitled Group",
      }),
    });

    const data = await response.json();
    if (data.success) {
      const newGroupId = data.group_id;

      // Step 2: Add a page to the newly created group
      const addPageResponse = await fetch("backend/addPages.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          title: notebook.title,
          group_id: newGroupId,
          page_content: "", // Default empty page content
        }),
      });

      const addPageData = await addPageResponse.json();
      if (addPageData.success) {
        // Step 3: Refresh the page after successfully adding the group and the page
        console.log("Good");
      } else {
        console.error("Failed to add a page to the new group");
      }
    } else {
      console.error("Failed to add group");
    }
  };

  const handleAddPages = async () => {
    const username = getCookie("username");

    // Find the current group based on the groupID from the URL
    const currentGroup = groups.find(
      (group) => group.group_id === parseInt(groupID),
    );
    if (!currentGroup) {
      console.error("No current group found");
      return;
    }

    const response = await fetch("backend/addPages.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        title: notebook.title,
        group_id: currentGroup.group_id,
        page_content: "", // Default empty page content
      }),
    });

    const data = await response.json();
    if (data.success) {
      // Refresh the page to reflect the new page
      console.log("Good");
    } else {
      console.error("Failed to add a page to the current group");
    }
  };

  const config = useMemo(
    () => ({
      buttons:
        "bold,italic,underline,strikethrough,eraser,ul,ol,font,fontsize,paragraph,lineHeight,superscript,subscript,image,video,spellcheck,speechRecognize,cut,copy,paste,selectall,copyformat,hr,table,link,symbols,indent,outdent,left,brush,undo,redo,find,fullsize,preview,print,about",

      cleanHTML: {
        denyTags: {
          script: true,
          button: true,
        },
      },
      enter: "BR",

      readonly: readOnly, // all options from https://xdsoft.net/jodit/docs/,
      placeholder: placeholder,
      theme: "light",
      controls: {
        font: {
          list: {
            Roboto: "Roboto",
            Calibri: "Calibri",
            Garamond: "Garamond",
            Futura: "Futura",
            "Comic Sans MS": "Comic-Sans",
          },
        },
        fontsize: {
          list: [4, 6, 8, 10, 12, 14, 16, 18, 22, 26, 32, 40, 48, 56, 64],
        },
      },
      width: "100%",
      height: 1000,
    }),
    [placeholder, readOnly],
  );

  const getCookie = (name) => {
    let cookie = {};
    document.cookie.split(";").forEach(function (el) {
      let split = el.split("=");
      cookie[split[0].trim()] = split.slice(1).join("=");
    });
    return cookie[name];
  };

  useEffect(() => {
    const fetchusername = async () => {
      try {
        const response = await fetch("backend/getUsername.php", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        // Check if the response is okay
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        // Assuming the response contains a 'username' field
        yourUsername = data.username;
      } catch (error) {
        console.error("Error fetching username:", error);
        if (!readOnly) {
          // Navigate to '/' if there's an error
          navigate("/"); // Using the navigate function to redirect
        }
      }
    };

    fetchusername(); // Call the fetch function
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const currentUsername = yourUsername;

  useEffect(() => {
    let connInterval = null;

    // Define a helper to fetch / update connected users
    const fetchConnected = async () => {
      try {
        const resp = await fetch("backend/getConnectedUsers.php", {
          method: "POST",
          credentials: "include", // <— must send token cookie
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pageid: parseInt(pageNum),
            groupid: parseInt(groupID),
          }),
        });
        const data = await resp.json();
        if (data.connected_users && Array.isArray(data.connected_users)) {
          // data.connected_users is now an array of {username, last_activity}
          setConnectedUsers(data.connected_users.map((x) => x.username));
        } else {
          setConnectedUsers([]);
        }
      } catch (err) {
        console.error("Error fetching connected users:", err);
        setConnectedUsers([]);
      }
    };

    // Immediately fetch once, then setInterval
    fetchConnected();
    connInterval = setInterval(fetchConnected, 2000);

    // Clean up on unmount or when pageNum/groupID changes
    return () => {
      if (connInterval) clearInterval(connInterval);
    };
  }, [pageNum, groupID]);

  // Handle drag end for reordering
  const handleDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return; // Dropped outside the list

    // Reorder groups array
    const reorderedGroups = Array.from(groups);
    const [movedGroup] = reorderedGroups.splice(source.index, 1);
    reorderedGroups.splice(destination.index, 0, movedGroup);

    // Update state and persist the new order
    setGroups(reorderedGroups);

    console.log(reorderedGroups);
    console.log(reorderedGroups.map((group) => group.group_id));

    // Send new order to backend to persist it
    const username = yourUsername;
    await fetch("backend/updateGroupOrder.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username,
        title: notebook.title,
        reorderedGroups: reorderedGroups.map((group) => group.group_id), // Send only group IDs in the new order
      }),
    });
  };

  const handlePageDragEnd = async (result) => {
    const { source, destination } = result;

    // Check if the item was dropped outside any droppable area
    if (!destination) return;

    // Parse group IDs from the source and destination droppable IDs
    const sourceGroupId = parseInt(source.droppableId.split("-")[1]);
    const destinationGroupId = parseInt(destination.droppableId.split("-")[1]);

    // Only proceed if the item was dropped within the same group
    if (sourceGroupId !== destinationGroupId) return;

    // Find the index of the group in the current state
    const groupIndex = groups.findIndex(
      (group) => group.group_id === sourceGroupId,
    );
    const reorderedPages = Array.from(groups[groupIndex].pages);

    // Reorder pages within the group
    const [movedPage] = reorderedPages.splice(source.index, 1);
    reorderedPages.splice(destination.index, 0, movedPage);

    // Update the state with the reordered pages in the specific group
    const updatedGroups = [...groups];
    updatedGroups[groupIndex] = {
      ...groups[groupIndex],
      pages: reorderedPages,
    };
    setGroups(updatedGroups);

    // Update page order in the backend
    try {
      const response = await fetch("backend/updatePageOrder.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group_id: sourceGroupId,
          reorderedPages: reorderedPages.map((page, index) => ({
            page_number: page.page_number,
            page_order: index + 1,
          })),
        }),
      });

      // Optional: Check for successful response
      const data = await response.json();
      if (!data.success) {
        console.error(
          "Failed to update page order on the backend:",
          data.message,
        );
      }
    } catch (error) {
      console.error("Error updating page order:", error);
    }
  };

  const toggleGroup = (groupIndex) => {
    setExpanded((prevExpanded) => {
      const newExpanded = [...prevExpanded];
      newExpanded[groupIndex] = !newExpanded[groupIndex]; // Toggle visibility for the specific group
      return newExpanded;
    });
  };

  // Fetch the user's notebooks
  useEffect(() => {
    const fetchNotebooks = async () => {

      console.log("fetch notebook");
      const response = await fetch("backend/notebookFinder.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ yourUsername }),
      });
      const data = await response.json();
      console.log(data);
      if (Array.isArray(data)) {
        setNotebooks(data); // Assuming the response is an array of notebooks
      } else {
        console.error("Failed to fetch notebooks");
      }
    };

    fetchNotebooks();
  }, []);



  const fetchGroups = async (
    isInitialFetch = false,
    currentNotebookOrder = [],
    username,
    notebook,
    readOnly,
  ) => {
    const response = await fetch("backend/getNotebookGroups.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        yourUsername: username,
        title: notebook.title,
        isInitialFetch,
        currentNotebookOrder,
        guest: readOnly,
      }),
    });

    const data = await response.json();

    if (data.success) {


      // Compare fetchedGroups with current groups (optional, depending on your use case)

      if (data.success) {
        // Update state here
        setGroups(data.groups);
        setNotebookId(data.notebook_id);
      } else {
        console.error("Failed to fetch groups and pages");
      }
    } else {
      console.error("Failed to fetch groups and pages");
    }
  };

  const startPolling = (isInitialFetch, currentNotebookOrder) => {
    // Fetch groups initially or on updates
    fetchGroups(
      isInitialFetch,
      currentNotebookOrder,
      yourUsername,
      notebook,
      readOnly,
    );

    // Set up the polling
    timeoutRef.current = setTimeout(() => {
      startPolling(false, currentNotebookOrder); // Recurse for polling
    }, 2000); // Adjust the interval as needed
  };

  useEffect(() => {
    cancelPolling(); // Cancel any ongoing polling when groupID or pageNum changes
    startPolling(true, []); // Start the polling with the new groupID or pageNum
  }, [groupID, pageNum, notebook.title]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup on component unmount or when polling stops
  useEffect(() => {
    return () => {
      cancelPolling(); // Clean up polling when component unmounts
    };
  }, []);

  const fetchSharedNotebooks = async () => {
    const response = await fetch("backend/getSharedNotebooks.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: currentUsername }),
    });
    const data = await response.json();
    if (Array.isArray(data)) {
      setSharedNotebooks(data);
    } else {
      console.error("Failed to fetch shared notebooks");
    }
  };

  // Fetch shared notebooks
  useEffect(() => {
    fetchSharedNotebooks();
  }, [currentUsername]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNotebookClick = async (otherNotebook) => {
    const response = await fetch("backend/getNotebookGroups.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: currentUsername,
        title: otherNotebook.title,
      }), // Corrected parameter name
    });

    const data = await response.json();

    if (data.success && Array.isArray(data.groups) && data.groups.length > 0) {
      // Ensure groups and pages exist as expected
      const firstGroup = data.groups[0];
      const firstPage =
        firstGroup.pages && firstGroup.pages.length > 0
          ? firstGroup.pages[0]
          : null;

      if (firstPage) {
        // Navigate to the first page of the first group
        navigate(`/notebooks/${firstGroup.group_id}/${firstPage.page_number}`, {
          state: {
            notebook: otherNotebook,
            group: firstGroup,
            page: firstPage,
            readOnly: readOnly,
          },
        });
      } else {
        // Navigate to the group if no pages exist
        navigate(`/notebooks/${firstGroup.group_id}`, {
          state: {
            notebook: otherNotebook,
            group: firstGroup,
            readOnly: readOnly,
          },
        });
      }
    } else {
      // If no groups exist, navigate to the notebook page to create groups
      navigate(`/notebooks/${otherNotebook.id}`, {
        state: { notebook: otherNotebook, readOnly: readOnly },
      });
    }
  };

  //This is where code from the testpagewrite.jsx starts



  const saveContentToServer = async () => {
    if (editor.current) {
      const jsonData = {
        pageid: pageNum,
        groupid: groupID,
        updatetext: editor.current.value,
      };

      await fetch("backend/saveNotebook.php", {
        method: "POST",
        body: JSON.stringify(jsonData),
      });
      //console.log('content saved!')
    }
  };



  const updateContents = () => {
    //console.log(lastModDate); // Logs the last modification date (datetime string)
    //console.log(lastUser);    // Logs the last user who edited
  };

  const save_on = () => {
    if (!readOnly) {
      // Convert lastModDate to a timestamp (milliseconds)
      const lastModTimestamp = new Date(lastModDate).getTime(); // Convert datetime string to timestamp
      const currentTime = Date.now(); // Get current time in milliseconds
      //console.log(currentTime-lastModTimestamp)
      if (lastUser === null || lastUser === yourUsername) {
        // If the current user is the one who last modified, update last modification date
        setLastModDate(currentTime); // Set new modification timestamp
        saveContentToServer(); // Save content to server
      } else if (lastModTimestamp && currentTime - lastModTimestamp > 5000) {
        // If the content was modified less than 5 seconds ago, allow the user to take over

        setLastUser(yourUsername); // Set the current user as the last user
        setLastModDate(currentTime); // Update the last modification timestamp
        saveContentToServer(); // Save content to server
      } else {
        // If the content is being edited by someone else and more than 5 seconds have passed, show an error
        const handleShowIncor = () =>
          ghosta.fire({
            headerTitle: "ERROR",
            description: `${lastUser} is editing, please try again in a few seconds`,
            showCloseButton: true,
          });
        handleShowIncor(); // Display the error message
      }
    }
  };

  function replaceBrTags(htmlString) {
    return htmlString.replace(/<br\s*\/?>/gi, "<br/>");
  }

  const fetchPageContent = async (isInitialFetch = false) => {
    const jsonDataLoad = {
      pageid: pageNum,
      groupid: groupID,
      guest: readOnly,
      isInitialFetch: isInitialFetch, // Pass the isInitialFetch value
    };

    try {
      const response = await fetch("backend/getPageContent.php", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonDataLoad),
      });

      const data = await response.json();
      console.log(data);

      if (data["page_name"]) {
        setPageName(data["page_name"]);
      } else {
        setPageName("Untitled Page");
      }

      if (data["content"]) {
        const elements = document.getElementsByClassName("jodit-wysiwyg");
        if (elements.length > 0) {
          const firstElement = elements[0];
          const currentContent = replaceBrTags(firstElement.innerHTML);
          const cursorPosition = getCaretCharacterOffsetWithin(firstElement);

          // Check if content is different before updating
          if (yourUsername !== data["last_user"] || isInitialFetch) {
            // Update the last modification date and last user state
            setLastModDate(data["last_mod"]);
            setLastUser(data["last_user"]);
            console.log(data);
            if (currentContent !== replaceBrTags(data["content"])) {
              // Update the content if it's different
              firstElement.innerHTML = data["content"];

              // Restore caret position after updating content
              setTimeout(() => {
                setCaretPosition(firstElement, cursorPosition);
              }, 0);
            }
          }
        }
      } else {
        if (data["error"]) {
          if (!readOnly) {
            navigate("/"); // Using the navigate function to redirect
          }
        }
        // Clear content if needed
        const elements = document.getElementsByClassName("jodit-wysiwyg");
        if (elements.length > 0) {
          elements[0].innerHTML = ""; // Clear the editor
          setContent("");
        }
      }
    } catch (error) {
      console.error("Error fetching page content:", error);
    }
  };

  // Polling interval ref to handle regular polling
  const pollingInterval = useRef(null);

  useEffect(() => {
    // Start initial fetch when pageNum or groupID changes
    fetchPageContent(true); // Pass true for the initial fetch

    // Setup the polling interval to keep fetching continuously
    pollingInterval.current = setInterval(() => {
      fetchPageContent(false); // Pass false to indicate it's a follow-up poll
    }, 2000); // Poll every 1 second (adjust as needed)

    // Cleanup function to clear the interval when pageNum/groupID changes or component unmounts
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current); // Stop polling when pageNum/groupID changes
      }
    };
  }, [pageNum, groupID]); // eslint-disable-line react-hooks/exhaustive-deps



  // Fetch existing users who have access to this notebook
  const fetchSharedUsers = async () => {
    try {
      const response = await fetch("backend/getSharedUsers.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notebook_id: notebookId }), // Send the current notebook ID
      });
      const data = await response.json();
      if (data.success) {
        setSharedUsers(data.users); // Assuming users is an array of usernames
      } else {
        console.error("Failed to fetch shared users");
      }
    } catch (error) {
      console.error("Error fetching shared users:", error);
    }
  };

  // Handle Give Access button click
  const handleGiveAccess = async () => {
    setErrorMessage("");

    if (newUsername.trim() === "") {
      // Check if the input field is empty
      setErrorMessage("You can't leave this field empty.");
      return;
    } else if (newUsername === currentUsername) {
      // check if the user is trying to add themselves
      setErrorMessage("You can't give yourself access.");
      return;
    }

    try {
      const response = await fetch("backend/addSharedUser.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notebook_id: notebookId,
          username: newUsername,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setSharedUsers([...sharedUsers, newUsername]); // update the list with the new user
        setNewUsername(""); // clear the input field after successful update
      } else {
        setErrorMessage(data.message);
      }
    } catch (error) {
      console.error("Error adding user access:", error);
    }
  };

  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      {/* Formatting the Note-Taking App via Flexbox
       * This layout below is the order for mobile viewing.
       * Desktop and midrange layouts are handled via CSS.
       */}
      <div className="notebooksPageWrapper">
        {/* Header */}
        <div className="nbpHeader">
          <div className="nbpHeaderLeft">
            <Link to="/note">
              <img src={logo} className="nbpLogo" />
            </Link>
            <span>C5-Note</span>
          </div>
          <div className="nbpHeaderRight">
            <Link to="/note">
              <button className="nbpButtonHome nbpAlignRight">Profile</button>
            </Link>
          </div>
        </div>

        {/* Toolbar */}
        <div className="Above_toolbar">
          <div id="above_Mode">
            {!readOnly && (
              <>
                <h2>Edit Mode</h2>
              </>
            )}
            {readOnly && (
              <>
                <h2>View Mode</h2>
              </>
            )}
          </div>
          <div id="Page Title">
            <h2>{pageName}</h2>
          </div>
          <div id="above_buttons">
            <button className="nbpButtonHome" onClick={handleDownloadShow}>
              Download
            </button>
            <button className="nbpButtonHome" onClick={handleShow}>
              Access
            </button>{" "}
            {/* shows Modal */}
          </div>
        </div>

        <article className="nbpMain">
          <div className="Editor_Area">
            {/* Lorem Ipsum for filler until note pages implemented */}
            <div className="custom-toolbar-example">
              <GhostaContainer />
              <JoditEditor
                id="editor"
                ref={editor}
                value={content}
                config={config}
                tabIndex={1} // tabIndex of textarea
                onBlur={(newContent) => updateContents(newContent)} // preferred to use only this option to update the content for performance reasons
                onChange={(newContent) => save_on(newContent)}
              />
            </div>
          </div>
        </article>

        <aside className="aside nbpSidebarNotebooks">
          {!readOnly && (
            <h1
              className="clickableNotebookTitle currentNotebookTitle"
              style={{ backgroundColor: notebook.color }}
              onClick={() =>
                navigate(`/notebooks/${notebook.title}`, {
                  state: { notebook, readOnly },
                })
              }
            >
              {notebook.title}
            </h1>
          )}
          {readOnly && (
            <h1
              className="currentNotebookTitle"
              style={{ backgroundColor: notebook.color }}
            >
              {notebook.title}
            </h1>
          )}
          <h3>My Other Notebooks</h3>
          <ul style={{ padding: 0 }}>
            {notebooks.filter(
              (otherNotebook) => otherNotebook.title !== notebook.title,
            ).length === 0 ? (
              <p>You don&apos;t have any other notebooks.</p>
            ) : (
              notebooks
                .filter(
                  (otherNotebook) => otherNotebook.title !== notebook.title,
                ) // Exclude current notebook
                .map((otherNotebook, index) => (
                  <li key={index}>
                    <button
                      className="clickableNotebookTitle otherNotebookTitle"
                      style={{ backgroundColor: otherNotebook.color }}
                      onClick={() => handleNotebookClick(otherNotebook)}
                    >
                      {otherNotebook.title}
                    </button>
                  </li>
                ))
            )}
          </ul>

          <h3>Shared Notebooks</h3>
          <ul style={{ padding: 0 }}>
            {sharedNotebooks.filter(
              (sharedNotebook) => sharedNotebook.title !== notebook.title,
            ).length === 0 ? (
              <p>No shared notebooks available.</p>
            ) : (
              sharedNotebooks
                .filter(
                  (sharedNotebook) => sharedNotebook.title !== notebook.title,
                )
                .map((otherNotebook, index) => (
                  <li key={index}>
                    <button
                      className="clickableNotebookTitle otherNotebookTitle"
                      style={{ backgroundColor: otherNotebook.color }}
                      onClick={() => handleNotebookClick(otherNotebook)}
                    >
                      {otherNotebook.title}
                    </button>
                  </li>
                ))
            )}
          </ul>

          <h3>Connected users:</h3>
          <div className="users_div">
            {connectedUsers.length === 0 ? (
              <em>No one else is viewing right now</em>
            ) : (
              connectedUsers.map((u) => <div key={u}>{u}</div>)
            )}
          </div>
        </aside>

        <aside className="aside nbpSidebarPages">
          <div className="sidebar-actions">
            <button
              onClick={handleAddGroup}
              disabled={readOnly}
              className="add-group-button"
            >
              Add Group
            </button>
            <button
              onClick={handleAddPages}
              disabled={readOnly}
              className="add-page-button"
            >
              Add Page
            </button>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            {" "}
            {/* Drag context for groups */}
            <Droppable droppableId="groups" type="group">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {groups.map((group, index) => (
                    <Draggable
                      key={group.group_id}
                      draggableId={`group-${group.group_id}`}
                      index={index}
                      isDragDisabled={expanded[index] || readOnly} // Disable dragging if the group is expanded
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <GroupDropdown
                            group={group}
                            notebook={notebook}
                            isExpanded={expanded[index]}
                            toggleGroup={() => toggleGroup(index)}
                            isSelectedGroup={
                              group.group_id === parseInt(groupID)
                            }
                            selectedPage={parseInt(pageNum)}
                            readOnly={readOnly}
                            handlePageDragEnd={handlePageDragEnd} // Pass handlePageDragEnd as a prop
                            Groups={groups}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </aside>

        <footer
          className="nbpFooter"
          style={{ backgroundColor: notebook.color }}
        >
          Footer
        </footer>
      </div>

      {/* access buttom modal/popup */}
      <Modal show={showAccessModal} onHide={handleClose} centered>
        <Modal.Header className="modal-header-custom">
          <Modal.Title className="modal-title-wrapper">
            <span className="modal-title">{notebook.title}</span>
            <p className="modal-created-by">
              Created by: {getCookie("username")}
            </p>
          </Modal.Title>
          <Button onClick={handleClose} className="modal-close-button">
            &times;
          </Button>
        </Modal.Header>

        <Modal.Body>
          <ul>
            {sharedUsers.map((user, index) => (
              <li key={index}>{user}</li> // Display each shared user
            ))}
          </ul>

          {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

          <div style={{ display: "flex", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Enter username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)} // Update state with input
            />
            <Button variant="primary" onClick={handleGiveAccess}>
              Give Access
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Download Modal */}
      <Modal show={showDownloadModal} onHide={handleDownloadClose} centered>
        <Modal.Header>
          <Modal.Title>Download Options</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <h5>Select File Format:</h5>
            <div>
              <input
                type="radio"
                id="pdf"
                name="format"
                value=".pdf"
                checked={selectedFormat === ".pdf"}
                onChange={handleFormatChange}
              />
              <label htmlFor="pdf">PDF (.pdf)</label>
            </div>
            <div>
              <input
                type="radio"
                id="docx"
                name="format"
                value=".docx"
                onChange={handleFormatChange}
              />
              <label htmlFor="docx">Word Document (.docx)</label>
            </div>
            <div>
              <input
                type="radio"
                id="txt"
                name="format"
                value=".txt"
                onChange={handleFormatChange}
              />
              <label htmlFor="txt">Text File (.txt)</label>
            </div>
          </div>

          <div style={{ fontSize: "0.85em", color: "grey", marginTop: "10px" }}>
            For a customized download location, enable &quot;Ask where to save
            each file before downloading&quot; in your browser&apos;s settings.
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleDownloadClose}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleDownload}>
            Download
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
