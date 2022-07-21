import { useState } from "react";
import { ObjectId } from "mongodb";
import { createEditor } from "slate";
import { Slate, Editable, withReact } from "slate-react";

const initialValue = [
  {
    type: "paragraph",
    children: [{ text: "This is your placeholder" }],
  },
];

function RichTextEditor({ value, onChange }) {
  const [editor] = useState(() => withReact(createEditor()));

  return (
    <Slate
      editor={editor}
      value={value || initialValue}
      onChange={(value) => {
        const isAstChange = editor.operations.some(
          (op) => "set_selection" !== op.type
        );
        if (!isAstChange) return;
        onChange(JSON.stringify(value));
      }}>
      <Editable />
    </Slate>
  );
}

function jsonify(val) {
  return JSON.parse(JSON.stringify(val));
}

export default function Homepage({ _id }) {
  const [faq, setFaq] = useState({
    question: undefined,
    answer: undefined,
  });
  const [faqs, setFaqs] = useState([]);

  const save = () => {
    setFaqs((prev) => [{ _id, ...faq }, ...prev]);
    setFaq(initialValue);
  };

  const { question, answer } = faq;

  return (
    <div className="mt-16 container mx-auto">
      <div className="flex flex-col  w-1/4 bg-white">
        <div className=" p-4  text-gray-800">
          <div className="px-3  font-medium text-small">Question</div>
          <div className="border  p-2">
            <div className="font-thin">
              <RichTextEditor
                placeholder={initialValue}
                onChange={(question) => {
                  setFaq((prev) => ({
                    ...prev,
                    question: jsonify(question) || [],
                  }));
                }}
                value={question}
              />
            </div>
          </div>
        </div>
        <div className=" p-4  text-gray-800">
          <div className="px-3  font-medium text-small">Answer</div>
          <div className="border  p-2">
            <div className="font-thin">
              <RichTextEditor
                placeholder={initialValue}
                onChange={(answer) =>
                  setFaq((prev) => ({
                    ...prev,
                    answer: jsonify(answer),
                  }))
                }
                value={answer}
              />
            </div>
          </div>

          <div className=" p-4 ">
            <button
              className="border border-blue-500 bg-blue-400 hover:bg-blue-600 drop-shadow-sm  py-2 px-8 text-white"
              onClick={save}>
              save
            </button>
          </div>
        </div>

        <ul className="flex flex-col gap-3 p-4">
          {faqs.map((faq) => (
            <li className="border border-blue-400 bg-blue-500 drop-shadow-sm p-4  text-white">
              <div>
                <div>
                  <div className="font-medium text-sm">Q:</div>
                  <div className="font-thin">
                    {JSON.parse(jsonify(faq.question)).map((node) => (
                      <div>{renderNode(node)}</div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-sm">A:</div>
                  <div className="font-thin">
                    {JSON.parse(jsonify(faq.answer)).map((node) => (
                      <div>{renderNode(node)}</div>
                    ))}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function renderNode(node) {
  switch (node.type) {
    case "paragraph":
      return <p>{node.children[0].text}</p>;
    default:
      return "";
  }
}

export function getServerSideProps(req) {
  return {
    props: {
      _id: jsonify(new ObjectId()),
    },
  };
}
